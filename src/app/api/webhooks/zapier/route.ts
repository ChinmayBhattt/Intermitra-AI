import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { addDays, format } from 'date-fns';

// Use service role for webhook access (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/webhooks/zapier?type=renewals|failed_payments|new_signups
 *
 * Zapier polling trigger endpoints:
 * - renewals: Members due for renewal in 7 days
 * - failed_payments: Members with failed/overdue payments
 * - new_signups: Members who signed up in the last 24 hours
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'renewals': {
        const sevenDaysFromNow = format(addDays(new Date(), 7), 'yyyy-MM-dd');
        const { data, error } = await supabaseAdmin
          .from('member_subscriptions')
          .select('*, member:members(first_name, last_name, email), plan:membership_plans(name, price)')
          .eq('status', 'active')
          .eq('auto_renew', true)
          .lte('renewal_date', sevenDaysFromNow)
          .gte('renewal_date', format(new Date(), 'yyyy-MM-dd'));

        if (error) throw error;

        return NextResponse.json({
          type: 'renewal_reminders',
          count: data?.length || 0,
          members: (data || []).map((sub: Record<string, unknown>) => ({
            id: sub.id,
            member_name: `${(sub.member as Record<string, unknown>)?.first_name} ${(sub.member as Record<string, unknown>)?.last_name}`,
            member_email: (sub.member as Record<string, unknown>)?.email,
            plan_name: (sub.plan as Record<string, unknown>)?.name,
            renewal_date: sub.renewal_date,
            amount: (sub.plan as Record<string, unknown>)?.price,
          })),
        });
      }

      case 'failed_payments': {
        const { data, error } = await supabaseAdmin
          .from('payments')
          .select('*, member:members(first_name, last_name, email)')
          .in('status', ['failed', 'overdue'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return NextResponse.json({
          type: 'failed_payments',
          count: data?.length || 0,
          payments: (data || []).map((p: Record<string, unknown>) => ({
            id: p.id,
            member_name: `${(p.member as Record<string, unknown>)?.first_name} ${(p.member as Record<string, unknown>)?.last_name}`,
            member_email: (p.member as Record<string, unknown>)?.email,
            amount: p.amount,
            status: p.status,
            payment_date: p.payment_date,
          })),
        });
      }

      case 'new_signups': {
        const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
        const { data, error } = await supabaseAdmin
          .from('members')
          .select('*')
          .gte('join_date', yesterday)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          type: 'new_signups',
          count: data?.length || 0,
          members: (data || []).map((m: Record<string, unknown>) => ({
            id: m.id,
            name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            phone: m.phone,
            join_date: m.join_date,
          })),
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid type. Use: renewals, failed_payments, or new_signups',
            available_types: ['renewals', 'failed_payments', 'new_signups'],
            usage: '/api/webhooks/zapier?type=renewals',
          },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
