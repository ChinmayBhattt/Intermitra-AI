'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | undefined>();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .single();

        setUser({
          full_name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: profile?.role || 'staff',
        });
      }
    };
    getUser();
  }, [supabase]);

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)',
          },
        }}
      />
    </div>
  );
}
