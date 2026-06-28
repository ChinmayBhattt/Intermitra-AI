import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/ai/at-risk
 * Analyzes attendance patterns to flag at-risk members
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all active members with their recent attendance
    const { data: members } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, status')
      .eq('status', 'active')
      .eq('archived', false);

    if (!members || members.length === 0) {
      return NextResponse.json({ at_risk_members: [], message: 'No active members found' });
    }

    // For each member, check attendance in last 30 days vs previous 30 days
    const atRiskMembers = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    for (const member of members) {
      const { count: recentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('check_in_time', thirtyDaysAgo.toISOString());

      const { count: previousCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('check_in_time', sixtyDaysAgo.toISOString())
        .lt('check_in_time', thirtyDaysAgo.toISOString());

      const recent = recentCount || 0;
      const previous = previousCount || 0;

      // Flag if attendance dropped by 50% or more
      if (previous > 0 && recent < previous * 0.5) {
        const dropPercentage = Math.round(((previous - recent) / previous) * 100);

        // Get last visit
        const { data: lastVisit } = await supabase
          .from('attendance')
          .select('check_in_time')
          .eq('member_id', member.id)
          .order('check_in_time', { ascending: false })
          .limit(1);

        atRiskMembers.push({
          member_id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          attendance_drop: dropPercentage,
          recent_visits: recent,
          previous_visits: previous,
          last_visit: lastVisit?.[0]?.check_in_time || null,
          risk_level: dropPercentage > 75 ? 'high' : dropPercentage > 50 ? 'medium' : 'low',
        });
      }
    }

    // Sort by risk level
    atRiskMembers.sort((a, b) => b.attendance_drop - a.attendance_drop);

    return NextResponse.json({
      at_risk_members: atRiskMembers,
      total_analyzed: members.length,
      flagged_count: atRiskMembers.length,
      analysis_date: now.toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
