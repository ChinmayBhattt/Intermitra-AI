'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'admin',
            },
          },
        });
        if (error) throw error;
        // After signup, auto-login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          setError('Account created! Please check your email to verify, then log in.');
          setIsSignUp(false);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Image
            src="/dmviron-logo.png"
            alt="DMVIron"
            width={72}
            height={72}
            style={{ borderRadius: '14px' }}
          />
          <span className="auth-logo-text">DMVIron</span>
          <p className="auth-subtitle">
            {isSignUp ? 'Create your staff account' : 'Sign in to manage your gym'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--status-expired-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-5)',
            fontSize: 'var(--text-sm)',
            color: 'var(--status-expired)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@dmviron.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); setError(''); }}>
                Sign in
              </a>
            </>
          ) : (
            <>
              Need an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); setError(''); }}>
                Create one
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
