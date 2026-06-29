'use client';

import { useState } from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Bot, History, Shield, Gem, QrCode } from 'lucide-react';

const menuItems = [
  { href: '/plans', label: 'Membership Plans', icon: Gem },
  { href: '/attendance/scanner', label: 'QR Check-In', icon: QrCode },
  { href: '/ai-insights', label: 'AI Insights', icon: Bot },
  { href: '/activity-log', label: 'Activity Log', icon: History },
  { href: '/staff', label: 'Staff & Roles', icon: Shield },
];

export default function SettingsPage() {
  const [gymName, setGymName] = useState('DMVIron');

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  return (
    <div className="mobile-page">
      <MobileHeader title="More" />

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Image src="/assets/logo.svg" alt="DMVIron" width={56} height={56} style={{ margin: '0 auto 12px', borderRadius: 14 }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{gymName}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Gym Management</div>
      </div>

      <div className="glass-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="glass-list-item">
              <div className="glass-list-item__icon">
                <Icon size={18} />
              </div>
              <div className="glass-list-item__body">
                <div className="glass-list-item__title">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mobile-section-title" style={{ marginTop: 8 }}>Gym Info</div>
      <div className="glass-panel" style={{ padding: 16, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 8 }}>Gym Name</label>
        <input className="input-glass" value={gymName} onChange={(e) => setGymName(e.target.value)} />
        <button type="button" className="btn-glass-white" style={{ marginTop: 14 }} onClick={handleSave}>
          Save Settings
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 16, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
        <strong style={{ color: '#fff' }}>Zapier Reminders</strong>
        <p style={{ marginTop: 8 }}>Set ZAPIER_WEBHOOK_URL for renewal emails, payment failures, and welcome messages.</p>
      </div>
    </div>
  );
}
