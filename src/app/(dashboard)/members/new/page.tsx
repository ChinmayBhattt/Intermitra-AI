'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

export default function NewMemberPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    emergency_contact: '',
    emergency_phone: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('members').insert({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        emergency_contact: form.emergency_contact || null,
        emergency_phone: form.emergency_phone || null,
        status: form.status,
        join_date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_log').insert({
          staff_id: user.id,
          action: 'member_created',
          entity_type: 'member',
          entity_id: form.email,
          details: { member_name: `${form.first_name} ${form.last_name}` },
        });
      }

      toast.success('Member added successfully!');
      router.push('/members');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Add Member" subtitle="Members → New" />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h2 className="page-title">Add New Member</h2>
            <p className="page-subtitle">Fill in the member&apos;s details below</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="first_name">First Name *</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="last_name">Last Name *</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="form-input"
                    placeholder="Smith"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="555-0100"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    className="form-input"
                    value={form.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Initial Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>Emergency Contact</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency_contact">Contact Name</label>
                    <input
                      id="emergency_contact"
                      name="emergency_contact"
                      type="text"
                      className="form-input"
                      placeholder="Jane Smith"
                      value={form.emergency_contact}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency_phone">Contact Phone</label>
                    <input
                      id="emergency_phone"
                      name="emergency_phone"
                      type="tel"
                      className="form-input"
                      placeholder="555-0200"
                      value={form.emergency_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
