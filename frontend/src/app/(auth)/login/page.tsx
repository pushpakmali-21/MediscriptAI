"use client";

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            <Activity size={24} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">MediScript<span className="text-blue-600">AI</span></span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Or <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">create a new account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required 
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-slate-50 focus:bg-white" 
                  placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required 
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-slate-50 focus:bg-white" 
                  placeholder="••••••••" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot your password?</a>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
