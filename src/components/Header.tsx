'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <div className="header-breadcrumb">
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <span className="header-search-icon">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Search members, plans..."
            aria-label="Search"
          />
        </div>

        <button className="header-icon-btn" title="Notifications" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
          <span className="header-notification-dot" />
        </button>

        <button
          className="header-icon-btn"
          onClick={handleSignOut}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
