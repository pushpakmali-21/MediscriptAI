"use client";

import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonLink, Button } from '@/components/ui/Button';
import { DosageDots } from '@/components/ui/DosageDots';

export default function DashboardPage() {
  const { isAuthenticated, profile } = useUserStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Mock data for the dashboard
  const currentMedicines = [
    { name: 'Metformin 500mg', schedule: '1-0-1', nextDose: '8:00 PM (After Food)', takenToday: true },
    { name: 'Atorvastatin 10mg', schedule: '0-0-1', nextDose: '9:30 PM', takenToday: false },
    { name: 'Vitamin D3', schedule: '0-0-0', extra: 'Once weekly', nextDose: 'Sunday', takenToday: false },
  ];

  const recentVisits = [
    { date: 'Oct 1, 2026', doctor: 'Dr. Sharma', specialty: 'Endocrinology' },
    { date: 'Sep 15, 2026', doctor: 'Dr. Patel', specialty: 'Cardiology' },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="flex-1 bg-[var(--color-paper)] px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-border-light)] pb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">Health Dashboard</h1>
            <p className="text-ink-light">Welcome back, {profile?.name || 'User'}. Here is your medical overview.</p>
          </div>
          <ButtonLink href="/scan" variant="primary">
            New Scan
          </ButtonLink>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Current Meds & Timeline */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-ink">
                  Current Medications
                </h2>
                <Link href="/timeline" className="text-sm font-semibold text-brand hover:underline">View Timeline</Link>
              </div>
              
              <div className="grid gap-4">
                {currentMedicines.map((med, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-paper-warm)] gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 shrink-0 w-3 h-3 rounded-full ${med.takenToday ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} aria-hidden="true" />
                      <div>
                        <h3 className="font-display font-semibold text-ink text-lg mb-1">{med.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                          {med.schedule !== '0-0-0' ? (
                            <DosageDots pattern={med.schedule} size="sm" showLabels={true} />
                          ) : (
                            <span className="text-xs font-mono text-ink-muted">{med.extra}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-ink-light">
                          <span className="text-ink-muted mr-1">Next dose:</span> {med.nextDose}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={med.takenToday ? "secondary" : "primary"}
                      size="sm"
                      className="sm:w-auto w-full"
                    >
                      {med.takenToday ? 'Taken' : 'Mark Taken'}
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-border)]">
               <h2 className="font-display text-xl font-bold text-ink mb-6">
                  Safety & Interactions
               </h2>
               
               <div className="p-4 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)] flex items-start gap-3">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                   <polyline points="22 4 12 14.01 9 11.01"></polyline>
                 </svg>
                 <div>
                   <h4 className="font-semibold mb-1">No active interactions detected</h4>
                   <p className="text-sm opacity-90 leading-relaxed">Your current medication profile looks safe based on your known allergies and conditions. Always consult your doctor for medical advice.</p>
                 </div>
               </div>
            </section>
          </div>

          {/* Right Column: Profile Summary & History */}
          <div className="flex flex-col gap-8">
            <section className="bg-[var(--color-brand)] p-6 sm:p-8 rounded-xl shadow-md text-white border border-[var(--color-brand-dark)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">
                  Medical Profile
                </h2>
                <Link href="/profile" className="text-brand-light hover:text-white text-sm font-medium transition-colors">Edit</Link>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-brand-light">Age / Sex</span>
                  <span className="font-medium font-mono">{profile?.age || '28'} / M</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-brand-light">Weight</span>
                  <span className="font-medium font-mono">{profile?.weight || '70'} kg</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-brand-light">Allergies</span>
                  <span className="font-medium">{profile?.allergies?.length ? profile.allergies.join(', ') : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-light">Conditions</span>
                  <span className="font-medium">{profile?.chronicConditions?.length ? profile.chronicConditions.join(', ') : 'None'}</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-border)]">
              <h2 className="font-display text-xl font-bold text-ink mb-6">
                Recent Visits
              </h2>
              <div className="space-y-5">
                {recentVisits.map((visit, idx) => (
                  <div key={idx} className="flex flex-col gap-1 border-l-[3px] border-[var(--color-brand)] pl-4 py-1">
                    <span className="text-sm font-semibold text-ink">{visit.doctor} <span className="text-ink-muted font-normal">({visit.specialty})</span></span>
                    <span className="text-xs text-ink-light font-mono mt-1">{visit.date}</span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-6">
                View All History
              </Button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
