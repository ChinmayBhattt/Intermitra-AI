'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import MobileHeader from '@/components/mobile/MobileHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatMoney, formatDate, getFullName, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Payment, PaymentMethod, PaymentStatus, Member } from '@/lib/types';

const demoPayments: (Payment & { member?: Member })[] = [
  { id: '1', member_id: '1', amount: 49.99, status: 'paid', method: 'card', payment_date: '2025-06-01', created_at: '', member: { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@email.com', phone: '', status: 'active', join_date: '', created_at: '', updated_at: '', archived: false } },
  { id: '2', member_id: '2', amount: 29.99, status: 'paid', method: 'cash', payment_date: '2025-06-01', created_at: '', member: { id: '2', first_name: 'Mike', last_name: 'Chen', email: 'mike@email.com', phone: '', status: 'active', join_date: '', created_at: '', updated_at: '', archived: false } },
  { id: '3', member_id: '3', amount: 49.99, status: 'overdue', method: 'card', payment_date: '2025-05-15', due_date: '2025-05-30', created_at: '', member: { id: '3', first_name: 'Emily', last_name: 'Davis', email: 'emily@email.com', phone: '', status: 'paused', join_date: '', created_at: '', updated_at: '', archived: false } },
  { id: '4', member_id: '4', amount: 449.99, status: 'paid', method: 'stripe', payment_date: '2025-05-28', created_at: '', member: { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@email.com', phone: '', status: 'active', join_date: '', created_at: '', updated_at: '', archived: false } },
  { id: '5', member_id: '5', amount: 29.99, status: 'failed', method: 'card', payment_date: '2025-05-20', created_at: '', member: { id: '5', first_name: 'Lisa', last_name: 'Park', email: 'lisa@email.com', phone: '', status: 'expired', join_date: '', created_at: '', updated_at: '', archived: false } },
  { id: '6', member_id: '6', amount: 134.99, status: 'pending', method: 'bank_transfer', payment_date: '2025-06-02', created_at: '', member: { id: '6', first_name: 'David', last_name: 'Brown', email: 'david@email.com', phone: '', status: 'active', join_date: '', created_at: '', updated_at: '', archived: false } },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<(Payment & { member?: Member })[]>(demoPayments);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({ member_id: '', amount: '', method: 'cash' as PaymentMethod, notes: '', status: 'paid' as PaymentStatus });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('payments')
          .select('*, member:members(id, first_name, last_name, email, status)')
          .order('payment_date', { ascending: false });
        if (data && data.length > 0) setPayments(data as unknown as (Payment & { member?: Member })[]);

        const { data: membersData } = await supabase.from('members').select('*').eq('archived', false).order('first_name');
        if (membersData) setMembers(membersData);
      } catch { /* demo */ }
    };
    fetchData();
  }, [supabase]);

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('payments').insert({
        member_id: form.member_id,
        amount: parseFloat(form.amount),
        method: form.method,
        status: form.status,
        notes: form.notes || null,
        payment_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      toast.success('Payment logged successfully!');
      setShowModal(false);
      // Refresh
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to log payment');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = (payment: Payment & { member?: Member }) => {
    if (payment.member) {
      window.open(`/payments/invoice/${payment.id}`, '_blank');
    }
  };

  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter(p => p.status === statusFilter);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const failedCount = payments.filter(p => p.status === 'failed' || p.status === 'overdue').length;

  return (
    <div className="mobile-page">
      <MobileHeader title="Payments" showBack />

      <div className="summary-split">
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Revenue</div>
          <div className="summary-box__value">{formatMoney(totalRevenue)}</div>
        </div>
        <div className="summary-box glass-panel">
          <div className="summary-box__label">Overdue</div>
          <div className="summary-box__value">{failedCount}</div>
          <span className="summary-box__change summary-box__change--down">{formatMoney(pendingAmount)} pending</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'paid', 'pending', 'overdue', 'failed'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`month-pill ${statusFilter === s ? 'month-pill--active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="mobile-section-title" style={{ margin: 0 }}>Transactions</span>
        <button type="button" className="month-pill month-pill--active" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setShowModal(true)}>
          + Log
        </button>
      </div>

      <div className="glass-list">
        {filteredPayments.map((payment) => (
          <div key={payment.id} className="glass-list-item" style={{ cursor: 'default' }}>
            <div className="glass-list-item__icon">
              {payment.member ? getInitials(payment.member.first_name, payment.member.last_name) : '?'}
            </div>
            <div className="glass-list-item__body">
              <div className="glass-list-item__title">
                {payment.member ? getFullName(payment.member.first_name, payment.member.last_name) : 'Unknown'}
              </div>
              <div className="glass-list-item__sub">
                {payment.method.replace('_', ' ')} · {formatDate(payment.payment_date)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="glass-list-item__amount">{formatMoney(payment.amount)}</div>
              <StatusBadge status={payment.status} />
            </div>
          </div>
        ))}
      </div>

        {/* Log Payment Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Log Payment</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleLogPayment}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Member</label>
                    <select className="form-select" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} required>
                      <option value="">Select member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{getFullName(m.first_name, m.last_name)} — {m.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount ($)</label>
                      <input className="form-input" type="number" step="0.01" value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Method</label>
                      <select className="form-select" value={form.method}
                        onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="stripe">Stripe</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Optional payment notes..." rows={3} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glass-white" disabled={loading} style={{ width: 'auto', padding: '0 24px' }}>
                    {loading ? 'Saving...' : 'Log Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
