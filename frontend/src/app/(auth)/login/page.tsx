"use client";

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { setAuth, setProfile } = useUserStore();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    setAuth(true);
    setProfile({
      name: email.split('@')[0] || 'User',
      age: '30',
      weight: '70',
      allergies: [],
      chronicConditions: [],
      currentMedicines: []
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex-1 bg-[var(--color-paper)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="font-display text-2xl font-bold" style={{ color: "var(--color-brand)" }}>
            ℞
          </span>
          <span className="font-display font-semibold text-ink text-xl">
            MediScript<span style={{ color: "var(--color-brand)" }}>AI</span>
          </span>
        </Link>
        <h2 className="font-display text-3xl font-bold text-ink">Sign in to your account</h2>
        <p className="mt-2 text-sm text-ink-light">
          Or <Link href="/register" className="font-medium text-brand hover:underline">create a new account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-paper-warm)] py-8 px-4 sm:rounded-xl sm:px-10 border border-[var(--color-border)]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">Email address</label>
              <input 
                id="email" name="email" type="email" required 
                value={email} onChange={e => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-colors bg-white text-ink" 
                placeholder="you@example.com" 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-2">Password</label>
              <input 
                id="password" name="password" type="password" required 
                className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-colors bg-white text-ink" 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" name="remember-me" type="checkbox" 
                  className="h-4 w-4 text-brand focus:ring-brand border-border rounded accent-brand" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-ink">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-brand hover:underline">Forgot your password?</a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
