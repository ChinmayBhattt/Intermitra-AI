import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendRenewalReminder } from "@/lib/email";
import { addDays, format } from "date-fns";
import { getMemberName } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const targetDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("renewal_date", targetDate)
    .eq("status", "active")
    .eq("archived", false);

  let sent = 0;
  for (const member of members ?? []) {
    const { data: existing } = await supabase
      .from("email_logs")
      .select("id")
      .eq("member_id", member.id)
      .eq("type", "renewal_reminder")
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .single();

    if (!existing) {
      await sendRenewalReminder(
        member.id,
        member.email,
        getMemberName(member),
        format(new Date(member.renewal_date!), "MMMM d, yyyy")
      );
      sent++;
    }
  }

  await supabase
    .from("payments")
    .update({ status: "overdue" })
    .eq("status", "pending")
    .lt("due_date", format(new Date(), "yyyy-MM-dd"));

  return NextResponse.json({ sent, targetDate, membersChecked: members?.length ?? 0 });
}
