"use client";

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Activity } from 'lucide-react';

export default function RegisterPage() {
  const { setAuth, setProfile } = useUserStore();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuth(true);
    setProfile({
      name: formData.name || 'User',
      age: '',
      weight: '',
      allergies: [],
      chronicConditions: [],
      currentMedicines: []
    });
    router.push('/profile'); // Redirect to profile to complete setup
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
        <h2 className="text-3xl font-extrabold text-slate-900">Create an account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-slate-50 focus:bg-white" 
                  placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-slate-50 focus:bg-white" 
                  placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-slate-50 focus:bg-white" 
                  placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Create Account
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
