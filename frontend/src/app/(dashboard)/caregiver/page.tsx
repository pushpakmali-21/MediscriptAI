"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CaregiverPage() {
  const dependents = [
    { name: 'Mary Doe', relation: 'Mother', age: 68, upcomingMeds: 2, criticalAlerts: 0 },
    { name: 'Robert Doe', relation: 'Father', age: 72, upcomingMeds: 1, criticalAlerts: 1 },
  ];

  return (
    <div className="flex-1 bg-[var(--color-paper)] px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">Caregiver Mode</h1>
            <p className="text-ink-light">Manage and monitor medication schedules for your dependents.</p>
          </div>
          <Button variant="secondary" className="w-full md:w-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Add Dependent
          </Button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {dependents.map((dep, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-1">{dep.name}</h3>
                  <p className="text-sm font-medium text-ink-muted font-mono">{dep.relation} • {dep.age} y/o</p>
                </div>
                <Link href={`/dashboard?dependent=${dep.name}`} className="text-sm font-semibold text-brand hover:underline">
                  View Dashboard
                </Link>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-border-light)] p-4 rounded-lg flex-1">
                  <div className="font-display text-2xl font-bold text-brand mb-1">{dep.upcomingMeds}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Upcoming Meds</div>
                </div>
                <div className={`p-4 rounded-lg flex-1 border ${dep.criticalAlerts > 0 ? 'bg-signal-light border-signal text-signal-dark' : 'bg-[var(--color-paper-warm)] border-[var(--color-border-light)] text-ink'}`}>
                  <div className="font-display text-2xl font-bold mb-1">{dep.criticalAlerts}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${dep.criticalAlerts > 0 ? 'text-signal' : 'text-ink-muted'}`}>Safety Alerts</div>
                </div>
              </div>

              <div className="border-t border-[var(--color-border-light)] pt-6 flex-1">
                <h4 className="text-sm font-bold text-ink mb-4 font-display">Today's Schedule</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm p-3 bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-md">
                     <span className="font-semibold text-[var(--color-success)]">Amlodipine 5mg</span>
                     <span className="text-xs font-mono font-bold text-[var(--color-success)]">Taken (08:00 AM)</span>
                   </div>
                   <div className="flex justify-between items-center text-sm p-3 bg-[var(--color-paper-warm)] border border-[var(--color-border)] rounded-md">
                     <span className="font-semibold text-ink">Atorvastatin 20mg</span>
                     <span className="text-xs font-mono text-ink-muted">08:00 PM</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
