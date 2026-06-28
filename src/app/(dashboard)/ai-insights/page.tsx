'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { getInitials } from '@/lib/utils';
import { AlertTriangle, Mail, BarChart2, Target, Bot } from 'lucide-react';

const demoAtRiskMembers = [
  { id: '1', name: 'Lisa Park', email: 'lisa@email.com', status: 'expired', attendance_drop: 75, last_visit: '12 days ago', risk_reason: 'No visits in 12 days, previously visited 4x/week' },
  { id: '2', name: 'Emily Davis', email: 'emily@email.com', status: 'paused', attendance_drop: 60, last_visit: '8 days ago', risk_reason: 'Membership paused, attendance dropped 60%' },
  { id: '3', name: 'David Brown', email: 'david@email.com', status: 'active', attendance_drop: 50, last_visit: '6 days ago', risk_reason: 'Active member but visits dropped from 5x to 2x per week' },
];

const demoRetentionEmails = [
  {
    member: 'Lisa Park',
    subject: 'We miss you at DMVIron, Lisa! 💪',
    body: `Hi Lisa,\n\nWe noticed you haven't been to DMVIron in a while, and we miss seeing you! Your fitness journey is important to us.\n\nTo welcome you back, we'd love to offer you a complimentary personal training session with one of our certified trainers. Sometimes a fresh perspective on your workout routine is all it takes to reignite that spark!\n\nWe've also added some exciting new group classes — HIIT Fusion and Yoga Flow — that our members have been loving.\n\nReady to get back on track? Reply to this email or stop by the front desk.\n\nKeep pushing forward,\nThe DMVIron Team`,
  },
  {
    member: 'Emily Davis',
    subject: 'Your DMVIron membership is paused — let\'s get you back!',
    body: `Hi Emily,\n\nWe see your membership is currently on pause, and we wanted to check in. Whatever's keeping you away, we understand — life happens!\n\nWhen you're ready to return, here's what's waiting for you:\n• New cardio equipment (Peloton bikes!)\n• Extended weekend hours (now open until 10 PM)\n• A free smoothie on your first day back\n\nIf cost is a concern, we have some flexible plan options we'd love to discuss.\n\nWe're here whenever you're ready!\n\nBest,\nThe DMVIron Team`,
  },
];

const demoEngagementReport = `## DMVIron Monthly Engagement Report — June 2025

### Key Metrics
- **Total Active Members:** 185 (+12% MoM)
- **New Sign-ups:** 25 members
- **Churned Members:** 6 members
- **Net Growth:** +19 members
- **Avg Daily Check-ins:** 72 members

### Attendance Trends
Peak usage continues to be **5-7 PM on weekdays**, with Saturday mornings showing a 15% increase. Sunday attendance remains the lowest at an average of 45 check-ins.

### Member Segments
- **Power Users (5+ visits/week):** 38 members (21%)
- **Regular (3-4 visits/week):** 67 members (36%)
- **Casual (1-2 visits/week):** 52 members (28%)
- **At-Risk (<1 visit/week):** 28 members (15%)

### Revenue Highlights
- Monthly revenue: **$12,450** (+15% vs May)
- Premium plans now account for **42%** of revenue
- Annual Elite plan sign-ups increased by 3

### Recommendations
1. **Launch a "Bring a Friend" week** to capitalize on summer momentum
2. **Target the 28 at-risk members** with personalized outreach
3. **Consider a "Summer Shred" challenge** — member challenges increase retention by ~25%
4. **Expand Saturday morning class schedule** given increased demand`;

const demoPromotions = [
  { title: 'Summer Shred Challenge', description: '8-week fitness challenge with prizes. Historically increases retention by 25% among participants.', target: 'All active members', confidence: 'High' },
  { title: 'Bring-a-Friend Week', description: 'Free guest passes for active members. Typical conversion rate: 15-20% of guests sign up.', target: 'Power users & regulars', confidence: 'High' },
  { title: 'Annual Plan Discount', description: 'Limited-time 20% off Annual Elite plan. Targets quarterly members for upsell.', target: 'Quarterly plan members', confidence: 'Medium' },
  { title: 'Re-engagement Offer', description: 'One free month for returning members who cancelled in past 90 days.', target: 'Cancelled/expired members', confidence: 'Medium' },
];

type AITab = 'at-risk' | 'emails' | 'report' | 'promotions';

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState<AITab>('at-risk');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (tab: AITab) => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000); // Simulate API call
  };

  const tabs: { id: AITab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'at-risk', label: 'At-Risk Members', icon: AlertTriangle },
    { id: 'emails', label: 'Retention Emails', icon: Mail },
    { id: 'report', label: 'Engagement Report', icon: BarChart2 },
    { id: 'promotions', label: 'Promotions', icon: Target },
  ];

  return (
    <>
      <Header title="AI Insights" subtitle="Powered by Claude" />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h2 className="page-title">
              AI Insights <span className="ai-tag" style={{ marginLeft: 'var(--space-3)', verticalAlign: 'middle' }}>✨ Claude</span>
            </h2>
            <p className="page-subtitle">AI-powered analytics and recommendations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* At-Risk Members */}
        {activeTab === 'at-risk' && (
          <div>
            <div className="ai-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="ai-card-header">
                <span className="ai-card-icon" style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} strokeWidth={2} />
                </span>
                <h3 className="ai-card-title">At-Risk Member Detection</h3>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleGenerate('at-risk')}>
                  {generating ? <span className="spinner" /> : '🔄 Refresh Analysis'}
                </button>
              </div>
              <p className="ai-card-content">
                Members flagged based on attendance drop-off patterns. These members have reduced their gym visits significantly and may be at risk of cancellation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {demoAtRiskMembers.map((member) => (
                <div key={member.id} className="card" style={{ transition: 'all var(--transition-base)' }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                    <div className="table-member-avatar" style={{ width: 48, height: 48, fontSize: 'var(--text-base)' }}>
                      {getInitials(member.name.split(' ')[0], member.name.split(' ')[1])}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</span>
                        <StatusBadge status={member.status} />
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                        {member.risk_reason}
                      </p>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Last visit: {member.last_visit}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--status-expired)' }}>
                        {member.attendance_drop}%
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>drop</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">Send Email</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retention Emails */}
        {activeTab === 'emails' && (
          <div>
            <div className="ai-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="ai-card-header">
                <span className="ai-card-icon">✉️</span>
                <h3 className="ai-card-title">AI-Generated Retention Emails</h3>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleGenerate('emails')}>
                  {generating ? <span className="spinner" /> : '🔄 Generate New'}
                </button>
              </div>
              <p className="ai-card-content">
                Personalized re-engagement emails generated for at-risk members. Review and send directly.
              </p>
            </div>

            {demoRetentionEmails.map((email, i) => (
              <div key={i} className="card" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="card-header">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>To: {email.member}</div>
                    <h3 className="card-title">{email.subject}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-ghost btn-sm">📋 Copy</button>
                    <button className="btn btn-primary btn-sm">📧 Send</button>
                  </div>
                </div>
                <div className="card-body">
                  <pre style={{
                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    lineHeight: 1.7, background: 'none', padding: 0, margin: 0,
                  }}>
                    {email.body}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Engagement Report */}
        {activeTab === 'report' && (
          <div>
            <div className="ai-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="ai-card-header">
                <span className="ai-card-icon">📊</span>
                <h3 className="ai-card-title">Monthly Engagement Summary</h3>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleGenerate('report')}>
                  {generating ? <span className="spinner" /> : '🔄 Regenerate'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div style={{
                  fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8,
                }}>
                  {demoEngagementReport.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)', color: 'var(--brand-primary)' }}>{line.replace('### ', '')}</h3>;
                    if (line.startsWith('- ')) return <p key={i} style={{ paddingLeft: 'var(--space-4)' }}>• {line.replace('- ', '')}</p>;
                    if (line.match(/^\d+\./)) return <p key={i} style={{ paddingLeft: 'var(--space-4)' }}>{line}</p>;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promotions */}
        {activeTab === 'promotions' && (
          <div>
            <div className="ai-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="ai-card-header">
                <span className="ai-card-icon">🎯</span>
                <h3 className="ai-card-title">AI-Suggested Promotions</h3>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleGenerate('promotions')}>
                  {generating ? <span className="spinner" /> : '🔄 New Suggestions'}
                </button>
              </div>
              <p className="ai-card-content">
                Promotion ideas based on current membership trends, churn patterns, and seasonal data.
              </p>
            </div>

            <div className="grid-2">
              {demoPromotions.map((promo, i) => (
                <div key={i} className="card animate-in">
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{promo.title}</h3>
                      <span className={`badge ${promo.confidence === 'High' ? 'badge-active' : 'badge-paused'}`}>
                        {promo.confidence} confidence
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                      {promo.description}
                    </p>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      🎯 Target: {promo.target}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
