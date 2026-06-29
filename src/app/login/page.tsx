'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileShell from '@/components/mobile/MobileShell';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: 'admin' } },
        });
        if (signUpError) throw signUpError;
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setError('Account created! Verify email, then sign in.');
          setIsSignUp(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell showNav={false}>
      <div className="auth-phone-wrap">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/assets/logo.svg" alt="DMVIron" width={64} height={64} style={{ margin: '0 auto 16px', borderRadius: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>DMVIron</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
            {isSignUp ? 'Create staff account' : 'Sign in to manage your gym'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 16,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: '#f87171',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignUp && (
            <input
              type="text"
              className="input-glass"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="input-glass"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-glass"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn-glass-white" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Please wait...' : isSignUp ? '+ Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          {isSignUp ? (
            <>Have an account? <button type="button" onClick={() => { setIsSignUp(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', fontSize: 13 }}>Sign in</button></>
          ) : (
            <>New here? <button type="button" onClick={() => { setIsSignUp(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', fontSize: 13 }}>Create account</button></>
          )}
        </p>
      </div>
    </MobileShell>
  );
}
