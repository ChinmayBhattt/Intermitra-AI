'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import MobileHeader from '@/components/mobile/MobileHeader';
import MonthPills from '@/components/mobile/MonthPills';
import StatusBadge from '@/components/StatusBadge';
import { getInitials, getFullName, formatDate } from '@/lib/utils';
import type { Member, MemberStatus } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const demoMembers: Member[] = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@email.com', phone: '555-0101', status: 'active', join_date: '2025-01-15', created_at: '', updated_at: '', archived: false },
  { id: '2', first_name: 'Mike', last_name: 'Chen', email: 'mike@email.com', phone: '555-0102', status: 'active', join_date: '2025-02-20', created_at: '', updated_at: '', archived: false },
  { id: '3', first_name: 'Emily', last_name: 'Davis', email: 'emily@email.com', phone: '555-0103', status: 'paused', join_date: '2024-11-05', created_at: '', updated_at: '', archived: false },
  { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@email.com', phone: '555-0104', status: 'active', join_date: '2025-03-10', created_at: '', updated_at: '', archived: false },
  { id: '5', first_name: 'Lisa', last_name: 'Park', email: 'lisa@email.com', phone: '555-0105', status: 'expired', join_date: '2024-06-22', created_at: '', updated_at: '', archived: false },
];

const sparkHeights = [35, 55, 48, 72, 60, 85, 68];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(demoMembers);
  const [activeMonth, setActiveMonth] = useState(months[new Date().getMonth()]);
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let query = supabase.from('members').select('*').eq('archived', false).order('created_at', { ascending: false });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        const { data } = await query;
        if (data?.length) setMembers(data);
      } catch {
        /* demo */
      }
    };
    fetchMembers();
  }, [statusFilter, supabase]);

  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiredCount = members.filter((m) => m.status === 'expired' || m.status === 'cancelled').length;

  const filtered = statusFilter === 'all' ? members : members.filter((m) => m.status === statusFilter);

  return (
    <div className="mobile-page">
      <MobileHeader title="Members" showBack />

      <MonthPills months={months} active={activeMonth} onChange={setActiveMonth} />

      <div className="summary-split">
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Active</div>
          <div className="summary-box__value">{activeCount}</div>
          <span className="summary-box__change summary-box__change--up">
            <TrendingUp size={12} /> +8%
          </span>
          <div className="mini-sparkline">
            {sparkHeights.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Inactive</div>
          <div className="summary-box__value">{expiredCount}</div>
          <span className="summary-box__change summary-box__change--down">
            <TrendingDown size={12} /> -2%
          </span>
          <div className="donut-mini" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none' }}>
        {(['all', 'active', 'expired', 'paused', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`month-pill ${statusFilter === s ? 'month-pill--active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="mobile-section-title" style={{ margin: 0 }}>All Members</span>
        <Link href="/members/new" style={{ fontSize: 13, color: 'var(--brand-primary-light)', textDecoration: 'none' }}>
          + Add
        </Link>
      </div>

      <div className="glass-list">
        {filtered.map((member) => (
          <Link key={member.id} href={`/members/${member.id}`} className="glass-list-item">
            <div className="glass-list-item__icon">
              {getInitials(member.first_name, member.last_name)}
            </div>
            <div className="glass-list-item__body">
              <div className="glass-list-item__title">
                {getFullName(member.first_name, member.last_name)}
              </div>
              <div className="glass-list-item__sub">
                {member.status === 'active' ? 'Membership' : member.status} · {formatDate(member.join_date, 'MMM d')}
              </div>
            </div>
            <div className="glass-list-item__amount glass-list-item__amount--negative">
              <StatusBadge status={member.status} />
            </div>
          </Link>
        ))}
        {!filtered.length && (
          <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            No members found
          </div>
        )}
      </div>
    </div>
  );
}
