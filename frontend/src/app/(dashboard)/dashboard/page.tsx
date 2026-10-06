"use client";

import { useUserStore } from '@/store/useUserStore';
import { Pill, Calendar, Clock, AlertTriangle, CheckCircle2, User as UserIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isAuthenticated, profile } = useUserStore();
  const router = useRouter();

  // Mock data for the dashboard
  const currentMedicines = [
    { name: 'Metformin 500mg', schedule: '1-0-1', nextDose: '8:00 PM (After Food)', takenToday: true },
    { name: 'Atorvastatin 10mg', schedule: '0-0-1', nextDose: '9:30 PM', takenToday: false },
    { name: 'Vitamin D3', schedule: 'Once weekly', nextDose: 'Sunday', takenToday: false },
  ];

  const recentVisits = [
    { date: 'Oct 1, 2026', doctor: 'Dr. Sharma', specialty: 'Endocrinology' },
    { date: 'Sep 15, 2026', doctor: 'Dr. Patel', specialty: 'Cardiology' },
  ];

  useEffect(() => {
    // For demo purposes, we will just show the dashboard even if not auth
    // if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {profile?.name || 'User'}. Here is your medical overview.</p>
        </div>
        <Link 
          href="/scan" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Activity size={18} />
          New Scan
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Meds & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Pill className="text-blue-500" /> Current Medications
              </h2>
              <Link href="/timeline" className="text-sm font-medium text-blue-600 hover:underline">View Timeline</Link>
            </div>
            
            <div className="grid gap-4">
              {currentMedicines.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${med.takenToday ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                      {med.takenToday ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{med.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Schedule: {med.schedule}</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">Next: {med.nextDose}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                    Mark Taken
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
             <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <AlertTriangle className="text-amber-500" /> Safety & Interactions
             </h2>
             <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
               <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
               <div>
                 <h4 className="font-semibold text-amber-800">No active interactions detected</h4>
                 <p className="text-sm text-amber-700 mt-1">Your current medication profile looks safe based on your known allergies and conditions. Always consult your doctor for medical advice.</p>
               </div>
             </div>
          </motion.section>
        </div>

        {/* Right Column: Profile Summary & History */}
        <div className="flex flex-col gap-6">
          <motion.section 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon size={20} /> Medical Profile
              </h2>
              <Link href="/profile" className="text-white/80 hover:text-white text-sm">Edit</Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-white/80">Age / Sex</span>
                <span className="font-medium">{profile?.age || '28'} / M</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-white/80">Weight</span>
                <span className="font-medium">{profile?.weight || '70 kg'}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-white/80">Allergies</span>
                <span className="font-medium">{profile?.allergies?.length ? profile.allergies.join(', ') : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Conditions</span>
                <span className="font-medium">{profile?.chronicConditions?.length ? profile.chronicConditions.join(', ') : 'None'}</span>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
              <Calendar className="text-purple-500" /> Recent Visits
            </h2>
            <div className="space-y-4">
              {recentVisits.map((visit, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-l-2 border-purple-200 pl-4 py-1">
                  <span className="text-sm font-semibold text-slate-800">{visit.doctor} <span className="text-slate-500 font-normal">({visit.specialty})</span></span>
                  <span className="text-xs text-slate-500">{visit.date}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors border border-slate-200">
              View All History
            </button>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
