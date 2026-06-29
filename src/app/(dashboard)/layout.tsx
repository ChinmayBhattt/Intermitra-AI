'use client';

import { useEffect, useState } from 'react';
import MobileShell from '@/components/mobile/MobileShell';
import { createClient } from '@/lib/supabase/client';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="app-layout">
      <MobileShell>
        {mounted ? children : (
          <div className="mobile-page" style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            Loading...
          </div>
        )}
      </MobileShell>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 30, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            fontSize: '13px',
            fontFamily: 'var(--font-family)',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  );
}
