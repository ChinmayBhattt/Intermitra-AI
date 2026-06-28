'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { getInitials, getFullName, formatDate, debounce } from '@/lib/utils';
import Link from 'next/link';
import type { Member, MemberStatus } from '@/lib/types';

const demoMembers: Member[] = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@email.com', phone: '555-0101', status: 'active', join_date: '2025-01-15', created_at: '', updated_at: '', archived: false },
  { id: '2', first_name: 'Mike', last_name: 'Chen', email: 'mike@email.com', phone: '555-0102', status: 'active', join_date: '2025-02-20', created_at: '', updated_at: '', archived: false },
  { id: '3', first_name: 'Emily', last_name: 'Davis', email: 'emily@email.com', phone: '555-0103', status: 'paused', join_date: '2024-11-05', created_at: '', updated_at: '', archived: false },
  { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@email.com', phone: '555-0104', status: 'active', join_date: '2025-03-10', created_at: '', updated_at: '', archived: false },
  { id: '5', first_name: 'Lisa', last_name: 'Park', email: 'lisa@email.com', phone: '555-0105', status: 'expired', join_date: '2024-06-22', created_at: '', updated_at: '', archived: false },
  { id: '6', first_name: 'David', last_name: 'Brown', email: 'david@email.com', phone: '555-0106', status: 'cancelled', join_date: '2024-09-01', created_at: '', updated_at: '', archived: false },
  { id: '7', first_name: 'Ana', last_name: 'Martinez', email: 'ana@email.com', phone: '555-0107', status: 'active', join_date: '2025-05-18', created_at: '', updated_at: '', archived: false },
  { id: '8', first_name: 'Ryan', last_name: 'Taylor', email: 'ryan@email.com', phone: '555-0108', status: 'active', join_date: '2025-04-02', created_at: '', updated_at: '', archived: false },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(demoMembers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let query = supabase
          .from('members')
          .select('*')
          .eq('archived', false)
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (search) {
          query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data } = await query;
        if (data && data.length > 0) {
          setMembers(data);
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [search, statusFilter, supabase]);

  const handleSearch = debounce((value: string) => {
    setSearch(value);
  }, 300);

  const filteredMembers = members.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        m.first_name.toLowerCase().includes(term) ||
        m.last_name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <>
      <Header title="Members" subtitle="Manage gym members" />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h2 className="page-title">Members</h2>
            <p className="page-subtitle">{filteredMembers.length} members found</p>
          </div>
          <div className="page-header-actions">
            <Link href="/members/new" className="btn btn-primary">
              + Add Member
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-search">
            <span className="filter-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="table-member-cell">
                        <div className="table-member-avatar">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt="" />
                          ) : (
                            getInitials(member.first_name, member.last_name)
                          )}
                        </div>
                        <div>
                          <div className="table-member-name">
                            {getFullName(member.first_name, member.last_name)}
                          </div>
                          <div className="table-member-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={member.status} />
                    </td>
                    <td>{member.phone || '—'}</td>
                    <td>{formatDate(member.join_date)}</td>
                    <td>
                      <div className="table-actions">
                        <Link href={`/members/${member.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        <Link href={`/members/${member.id}?edit=true`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-title">No members found</div>
                        <div className="empty-state-text">
                          {search ? 'Try a different search term' : 'Add your first member to get started'}
                        </div>
                        <Link href="/members/new" className="btn btn-primary btn-sm">+ Add Member</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
