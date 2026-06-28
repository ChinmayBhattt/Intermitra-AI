'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate, getInitials, getFullName, timeAgo } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

// Demo data for charts when DB is empty
const demoGrowthData = [
  { month: 'Jan', active: 120, new_members: 15 },
  { month: 'Feb', active: 132, new_members: 18 },
  { month: 'Mar', active: 145, new_members: 20 },
  { month: 'Apr', active: 155, new_members: 16 },
  { month: 'May', active: 170, new_members: 22 },
  { month: 'Jun', active: 185, new_members: 25 },
];

const demoTrafficData = [
  { day: 'Mon', check_ins: 85 },
  { day: 'Tue', check_ins: 92 },
  { day: 'Wed', check_ins: 78 },
  { day: 'Thu', check_ins: 95 },
  { day: 'Fri', check_ins: 110 },
  { day: 'Sat', check_ins: 130 },
  { day: 'Sun', check_ins: 65 },
];

const demoPlanDistribution = [
  { name: 'Basic Monthly', value: 45, color: '#00b4d8' },
  { name: 'Premium Monthly', value: 35, color: '#48cae4' },
  { name: 'Basic Quarterly', value: 15, color: '#90e0ef' },
  { name: 'Annual Elite', value: 20, color: '#8b5cf6' },
];

const demoRecentMembers = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@email.com', status: 'active', join_date: '2025-06-20' },
  { id: '2', first_name: 'Mike', last_name: 'Chen', email: 'mike@email.com', status: 'active', join_date: '2025-06-18' },
  { id: '3', first_name: 'Emily', last_name: 'Davis', email: 'emily@email.com', status: 'paused', join_date: '2025-06-15' },
  { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@email.com', status: 'active', join_date: '2025-06-12' },
  { id: '5', first_name: 'Lisa', last_name: 'Park', email: 'lisa@email.com', status: 'expired', join_date: '2025-06-10' },
];

const demoRecentActivity = [
  { id: '1', action: 'member_checked_in', details: { member_name: 'Sarah Johnson' }, created_at: new Date(Date.now() - 300000).toISOString(), staff: { full_name: 'Front Desk' } },
  { id: '2', action: 'payment_logged', details: { member_name: 'Mike Chen', amount: 49.99 }, created_at: new Date(Date.now() - 1800000).toISOString(), staff: { full_name: 'Admin' } },
  { id: '3', action: 'member_created', details: { member_name: 'New Member' }, created_at: new Date(Date.now() - 3600000).toISOString(), staff: { full_name: 'Admin' } },
];

interface DashboardStats {
  totalActive: number;
  newThisMonth: number;
  churnRate: number;
  monthlyRevenue: number;
  attendanceToday: number;
  overduePayments: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--text-sm)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: 'var(--text-secondary)' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalActive: 185,
    newThisMonth: 25,
    churnRate: 3.2,
    monthlyRevenue: 12450,
    attendanceToday: 67,
    overduePayments: 4,
  });
  const [recentMembers, setRecentMembers] = useState(demoRecentMembers);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to fetch real data
        const { data: members } = await supabase
          .from('members')
          .select('*')
          .eq('archived', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (members && members.length > 0) {
          setRecentMembers(members);

          // Get active count
          const { count: activeCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('archived', false);

          // Get new this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          const { count: newCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .gte('join_date', startOfMonth.toISOString().split('T')[0]);

          // Get today's attendance
          const today = new Date().toISOString().split('T')[0];
          const { count: attendanceCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .gte('check_in_time', today);

          // Get overdue payments
          const { count: overdueCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'overdue');

          // Get monthly revenue
          const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('payment_date', startOfMonth.toISOString().split('T')[0]);

          const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          setStats({
            totalActive: activeCount || 0,
            newThisMonth: newCount || 0,
            churnRate: activeCount ? Math.round(((newCount || 0) / activeCount) * 100 * 10) / 10 : 0,
            monthlyRevenue: revenue,
            attendanceToday: attendanceCount || 0,
            overduePayments: overdueCount || 0,
          });
        }
      } catch {
        // Use demo data on error (e.g., no Supabase connection)
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      member_checked_in: 'checked in',
      payment_logged: 'logged a payment for',
      member_created: 'added new member',
      member_updated: 'updated',
      invoice_generated: 'generated an invoice for',
    };
    return actionMap[action] || action.replace(/_/g, ' ');
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back to DMVIron" />
      <div className="page-content">
        {/* KPI Stats */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Active Members</span>
              <span className="stat-card-icon">👥</span>
            </div>
            <div className="stat-card-value">{stats.totalActive}</div>
            <span className="stat-card-change positive">↑ 12% vs last month</span>
          </div>

          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">New This Month</span>
              <span className="stat-card-icon">🆕</span>
            </div>
            <div className="stat-card-value">{stats.newThisMonth}</div>
            <span className="stat-card-change positive">↑ 8% vs last month</span>
          </div>

          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Monthly Revenue</span>
              <span className="stat-card-icon">💰</span>
            </div>
            <div className="stat-card-value">{formatCurrency(stats.monthlyRevenue)}</div>
            <span className="stat-card-change positive">↑ 15% growth</span>
          </div>

          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Today&apos;s Check-ins</span>
              <span className="stat-card-icon">📋</span>
            </div>
            <div className="stat-card-value">{stats.attendanceToday}</div>
            <span className="stat-card-change positive">Peak at 5-7 PM</span>
          </div>

          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Churn Rate</span>
              <span className="stat-card-icon">📉</span>
            </div>
            <div className="stat-card-value">{stats.churnRate}%</div>
            <span className="stat-card-change negative">↑ 0.5% vs last month</span>
          </div>

          <div className="stat-card animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Overdue Payments</span>
              <span className="stat-card-icon">⚠️</span>
            </div>
            <div className="stat-card-value">{stats.overduePayments}</div>
            <span className="stat-card-change negative">Needs attention</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="chart-card animate-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Membership Growth</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Last 6 months</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoGrowthData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#4a4a5e" fontSize={12} />
                  <YAxis stroke="#4a4a5e" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="active"
                    name="Active Members"
                    stroke="#00b4d8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="new_members"
                    name="New Members"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNew)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card animate-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Weekly Traffic</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>This week</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoTrafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#4a4a5e" fontSize={12} />
                  <YAxis stroke="#4a4a5e" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="check_ins"
                    name="Check-ins"
                    fill="#00b4d8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: Plan Distribution + Recent Members + Activity */}
        <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Plan Distribution */}
          <div className="chart-card animate-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Plan Distribution</h3>
            </div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoPlanDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {demoPlanDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: 'var(--space-2)' }}>
              {demoPlanDistribution.map((plan) => (
                <div key={plan.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, flexShrink: 0 }} />
                  {plan.name} ({plan.value})
                </div>
              ))}
            </div>
          </div>

          {/* Recent Members */}
          <div className="card animate-in">
            <div className="card-header">
              <h3 className="card-title">Recent Members</h3>
              <a href="/members" className="btn btn-ghost btn-sm">View all →</a>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-5)',
                    borderBottom: '1px solid var(--border-primary)',
                    transition: 'background var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="table-member-avatar">
                      {getInitials(member.first_name, member.last_name)}
                    </div>
                    <div>
                      <div className="table-member-name" style={{ fontSize: 'var(--text-sm)' }}>
                        {getFullName(member.first_name, member.last_name)}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Joined {formatDate(member.join_date)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card animate-in">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <a href="/activity-log" className="btn btn-ghost btn-sm">View all →</a>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
              <div className="activity-timeline">
                {demoRecentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-item-header">
                      <span className="activity-item-user">
                        {activity.staff?.full_name}
                      </span>
                      <span className="activity-item-action">
                        {formatAction(activity.action)}
                      </span>
                    </div>
                    <div className="activity-item-action">
                      {(activity.details as Record<string, unknown>)?.member_name as string || ''}
                      {(activity.details as Record<string, unknown>)?.amount ? ` — ${formatCurrency((activity.details as Record<string, unknown>).amount as number)}` : ''}
                    </div>
                    <div className="activity-item-time">{timeAgo(activity.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Teaser */}
        <div className="ai-card animate-in">
          <div className="ai-card-header">
            <span className="ai-card-icon">🤖</span>
            <h3 className="ai-card-title">AI Insights</h3>
            <span className="ai-tag" style={{ marginLeft: 'auto' }}>✨ Powered by Claude</span>
          </div>
          <div className="ai-card-content">
            <p style={{ marginBottom: 'var(--space-3)' }}>
              <strong>3 members flagged as at-risk</strong> based on attendance drop-off in the past 2 weeks.
              Sarah Johnson, Mike Chen, and Lisa Park have all reduced gym visits by over 50%.
            </p>
            <p style={{ marginBottom: 'var(--space-4)' }}>
              Consider sending personalized re-engagement emails or offering a free PT session to retain them.
            </p>
            <a href="/ai-insights" className="btn btn-secondary btn-sm">
              View AI Insights →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
