"use client";

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { setAuth, setProfile } = useUserStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register logic
    setAuth(true);
    setProfile({
      name: name || email.split('@')[0] || 'User',
      age: '',
      weight: '',
      allergies: [],
      chronicConditions: [],
      currentMedicines: []
    });
    router.push('/profile'); // Redirect to profile setup first time
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
        <h2 className="font-display text-3xl font-bold text-ink">Create an account</h2>
        <p className="mt-2 text-sm text-ink-light">
          Or <Link href="/login" className="font-medium text-brand hover:underline">sign in to existing account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-paper-warm)] py-8 px-4 sm:rounded-xl sm:px-10 border border-[var(--color-border)]">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink mb-2">Full name</label>
              <input 
                id="name" name="name" type="text" required 
                value={name} onChange={e => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-colors bg-white text-ink" 
                placeholder="John Doe" 
              />
            </div>

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

            <div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </div>
            
            <p className="text-xs text-ink-muted text-center">
              By registering, you agree to our <Link href="/terms" className="underline hover:text-ink">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
