'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import MobileHeader from '@/components/mobile/MobileHeader';
import MonthPills from '@/components/mobile/MonthPills';
import QuickActions from '@/components/mobile/QuickActions';
import StatusBadge from '@/components/StatusBadge';
import { formatMoney, getInitials, getFullName, formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const demoPlans = [
  { name: 'Iron Elite', members: 48, price: '$449/mo' },
  { name: 'Iron Pro', members: 72, price: '$129/qtr' },
  { name: 'Iron Basic', members: 65, price: '$49/mo' },
];

const demoMembers = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', status: 'active', category: 'Premium' },
  { id: '2', first_name: 'Mike', last_name: 'Chen', status: 'active', category: 'Basic' },
  { id: '3', first_name: 'Emily', last_name: 'Davis', status: 'paused', category: 'Pro' },
  { id: '4', first_name: 'James', last_name: 'Wilson', status: 'active', category: 'Elite' },
  { id: '5', first_name: 'Lisa', last_name: 'Park', status: 'expired', category: 'Basic' },
];

const sparkHeights = [40, 65, 45, 80, 55, 90, 70];

export default function DashboardPage() {
  const [activeMonth, setActiveMonth] = useState(months[new Date().getMonth()]);
  const [stats, setStats] = useState({
    active: 185,
    revenue: 12450,
    checkIns: 67,
    churn: 3.2,
    activeChange: 12,
    revenueChange: -5,
  });
  const [recentMembers, setRecentMembers] = useState(demoMembers);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { count: active } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('archived', false);

        const { data: members } = await supabase
          .from('members')
          .select('id, first_name, last_name, status')
          .eq('archived', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (active != null) {
          setStats((s) => ({ ...s, active: active }));
        }
        if (members?.length) {
          setRecentMembers(
            members.map((m) => ({
              ...m,
              category: 'Member',
            }))
          );
        }
      } catch {
        /* demo data */
      }
    };
    load();
  }, [supabase]);

  return (
    <div className="mobile-page">
      <MobileHeader title="My Gym" />

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12, textAlign: 'center' }}>
        DMVIron · Membership Hub
      </p>

      <div className="membership-carousel">
        {demoPlans.map((plan) => (
          <div key={plan.name} className="membership-card">
            <div className="membership-card__brand">DMVIron</div>
            <div className="membership-card__plan">{plan.name}</div>
            <div className="membership-card__meta">{plan.members} active members</div>
            <div className="membership-card__balance">
              <span className="membership-card__amount">{plan.price}</span>
              <Link href="/plans" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }}>
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <MonthPills months={months.slice(Math.max(0, new Date().getMonth() - 2), new Date().getMonth() + 3)} active={activeMonth} onChange={setActiveMonth} />

      <div className="summary-split">
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Active Members</div>
          <div className="summary-box__value">{stats.active}</div>
          <span className="summary-box__change summary-box__change--up">
            <TrendingUp size={12} /> +{stats.activeChange}%
          </span>
          <div className="mini-sparkline">
            {sparkHeights.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Revenue</div>
          <div className="summary-box__value">{formatMoney(stats.revenue)}</div>
          <span className="summary-box__change summary-box__change--down">
            <TrendingDown size={12} /> {stats.revenueChange}%
          </span>
          <div className="donut-mini" />
        </div>
      </div>

      <div className="glass-panel glass-panel--strong" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="mobile-section-title" style={{ margin: 0 }}>Today&apos;s Activity</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{stats.checkIns} check-ins</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Churn Rate</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{stats.churn}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>At Risk</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>3</div>
          </div>
        </div>
      </div>

      <QuickActions />

      <div className="mobile-section-title">Recent Members</div>
      <div className="glass-list">
        {recentMembers.map((member) => (
          <Link key={member.id} href={`/members/${member.id}`} className="glass-list-item">
            <div className="glass-list-item__icon">
              {getInitials(member.first_name, member.last_name)}
            </div>
            <div className="glass-list-item__body">
              <div className="glass-list-item__title">
                {getFullName(member.first_name, member.last_name)}
              </div>
              <div className="glass-list-item__sub">{member.category}</div>
            </div>
            <StatusBadge status={member.status} />
          </Link>
        ))}
      </div>

      <Link href="/ai-insights" className="glass-panel" style={{ display: 'block', padding: 16, textDecoration: 'none', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>✨ AI Insights</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          3 members flagged at-risk. Tap to view retention drafts.
        </div>
      </Link>
    </div>
  );
}
