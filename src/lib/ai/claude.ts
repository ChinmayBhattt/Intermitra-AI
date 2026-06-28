import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { subDays, format } from "date-fns";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeAtRiskMembers() {
  const supabase = await createClient();
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const sixtyDaysAgo = subDays(new Date(), 60).toISOString();

  const { data: members } = await supabase
    .from("members")
    .select("*, membership_plans(name)")
    .eq("archived", false)
    .eq("status", "active");

  if (!members?.length) return [];

  const atRiskMembers = [];

  for (const member of members) {
    const { count: recentCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("member_id", member.id)
      .gte("checked_in_at", thirtyDaysAgo);

    const { count: priorCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("member_id", member.id)
      .gte("checked_in_at", sixtyDaysAgo)
      .lt("checked_in_at", thirtyDaysAgo);

    const recent = recentCount ?? 0;
    const prior = priorCount ?? 0;
    const dropOff = prior > 0 ? ((prior - recent) / prior) * 100 : 0;

    if (recent === 0 || dropOff > 50) {
      await supabase.from("members").update({ at_risk: true }).eq("id", member.id);
      atRiskMembers.push({ ...member, recentVisits: recent, priorVisits: prior, dropOffPercent: dropOff });
    } else {
      await supabase.from("members").update({ at_risk: false }).eq("id", member.id);
    }
  }

  if (process.env.ANTHROPIC_API_KEY && atRiskMembers.length > 0) {
    const summary = atRiskMembers
      .map(
        (m) =>
          `${m.first_name} ${m.last_name}: ${m.recentVisits} visits (30d), was ${m.priorVisits} (prior 30d), ${Math.round(m.dropOffPercent)}% drop`
      )
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Analyze these at-risk gym members and provide brief risk assessment for each (1-2 sentences each):\n${summary}`,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    await supabase.from("ai_insights").insert({
      type: "at_risk",
      content,
      metadata: { member_count: atRiskMembers.length },
    });
  }

  return atRiskMembers;
}

export async function generateRetentionEmail(memberId: string) {
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*, membership_plans(name)")
    .eq("id", memberId)
    .single();

  if (!member) throw new Error("Member not found");

  const { count } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .gte("checked_in_at", subDays(new Date(), 30).toISOString());

  if (!process.env.ANTHROPIC_API_KEY) {
    const draft = `Hi ${member.first_name},\n\nWe noticed you haven't been to DMVIron as much lately. We'd love to see you back! Your ${(member.membership_plans as { name: string } | null)?.name ?? "membership"} is still active.\n\nCome by this week — we'd be happy to help you get back on track.\n\n— The DMVIron Team`;
    await supabase.from("ai_insights").insert({
      member_id: memberId,
      type: "retention_email",
      content: draft,
    });
    return draft;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Write a personalized, warm retention email for a gym member who may be disengaging.

Member: ${member.first_name} ${member.last_name}
Plan: ${(member.membership_plans as { name: string } | null)?.name ?? "Standard"}
Visits last 30 days: ${count ?? 0}
Join date: ${member.join_date}
Status: ${member.status}

Keep it friendly, not pushy. Mention DMVIron Gym. Sign off as "The DMVIron Team". Return only the email body.`,
      },
    ],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  await supabase.from("ai_insights").insert({
    member_id: memberId,
    type: "retention_email",
    content,
  });

  return content;
}

export async function generateEngagementSummary() {
  const supabase = await createClient();
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

  const { count: activeMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("archived", false);

  const { count: totalCheckIns } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .gte("checked_in_at", thirtyDaysAgo);

  const { count: atRiskCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("at_risk", true);

  const { count: newMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .gte("join_date", format(subDays(new Date(), 30), "yyyy-MM-dd"));

  const stats = {
    activeMembers: activeMembers ?? 0,
    totalCheckIns: totalCheckIns ?? 0,
    atRiskCount: atRiskCount ?? 0,
    newMembers: newMembers ?? 0,
    period: format(new Date(), "MMMM yyyy"),
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    const summary = `Monthly Engagement Summary (${stats.period})\n\nActive Members: ${stats.activeMembers}\nTotal Check-ins: ${stats.totalCheckIns}\nNew Members: ${stats.newMembers}\nAt-Risk Members: ${stats.atRiskCount}\n\nAverage visits per member: ${stats.activeMembers ? (stats.totalCheckIns / stats.activeMembers).toFixed(1) : 0}`;
    await supabase.from("ai_insights").insert({
      type: "engagement_summary",
      content: summary,
      metadata: stats,
    });
    return summary;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Write a monthly engagement summary report for DMVIron Gym staff based on these stats:
- Active members: ${stats.activeMembers}
- Total check-ins (30 days): ${stats.totalCheckIns}
- New members (30 days): ${stats.newMembers}
- At-risk members: ${stats.atRiskCount}
- Period: ${stats.period}

Include key highlights, areas of concern, and 2-3 actionable recommendations. Professional but concise.`,
      },
    ],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  await supabase.from("ai_insights").insert({
    type: "engagement_summary",
    content,
    metadata: stats,
  });

  return content;
}

export async function suggestPromotions() {
  const supabase = await createClient();

  const { data: plans } = await supabase.from("membership_plans").select("*");
  const { data: members } = await supabase
    .from("members")
    .select("plan_id, status, join_date")
    .eq("archived", false);

  const planCounts: Record<string, number> = {};
  members?.forEach((m) => {
    if (m.plan_id) planCounts[m.plan_id] = (planCounts[m.plan_id] ?? 0) + 1;
  });

  const trends = plans
    ?.map((p) => `${p.name} (${p.billing_interval}): ${planCounts[p.id] ?? 0} members, $${p.price_cents / 100}`)
    .join("\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    const suggestion =
      "Based on membership trends:\n1. Offer a 'Bring a Friend' week to boost referrals\n2. Create a summer annual plan discount\n3. Launch a re-engagement challenge for at-risk members";
    await supabase.from("ai_insights").insert({ type: "promotion_suggestion", content: suggestion });
    return suggestion;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Suggest 3-4 specific promotional campaigns for DMVIron Gym based on current membership distribution:\n${trends}\n\nTotal members: ${members?.length ?? 0}. Focus on growth, retention, and upselling.`,
      },
    ],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  await supabase.from("ai_insights").insert({ type: "promotion_suggestion", content });
  return content;
}
