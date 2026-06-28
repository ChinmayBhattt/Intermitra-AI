'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: '📊' },
      { label: 'AI Insights', href: '/ai-insights', icon: '🤖' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Members', href: '/members', icon: '👥' },
      { label: 'Plans', href: '/plans', icon: '💎' },
      { label: 'Payments', href: '/payments', icon: '💳' },
      { label: 'Attendance', href: '/attendance', icon: '📋' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Check-In Scanner', href: '/attendance/scanner', icon: '📱' },
      { label: 'Staff', href: '/staff', icon: '🛡️' },
      { label: 'Activity Log', href: '/activity-log', icon: '📝' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

interface SidebarProps {
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
  overdueCount?: number;
}

export default function Sidebar({ user, overdueCount }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Inject badge count for payments
  const navWithBadges = navigation.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      badge: item.href === '/payments' ? overdueCount : undefined,
    })),
  }));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Image
          src="/dmviron-logo.png"
          alt="DMVIron"
          width={42}
          height={42}
          style={{ borderRadius: '10px' }}
        />
        <span className="sidebar-logo-text">DMVIron</span>
      </div>

      <nav className="sidebar-nav">
        {navWithBadges.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-label">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-link', isActive(item.href) && 'active')}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role || 'staff'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
