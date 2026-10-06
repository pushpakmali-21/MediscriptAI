"use client";

import { Button } from '@/components/ui/Button';

type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

interface TimelineMed {
  id: string;
  name: string;
  strength: string;
  timeOfDay: TimeOfDay;
  timeStr: string;
  instructions: string;
  status: 'taken' | 'upcoming' | 'missed';
}

const mockTimeline: TimelineMed[] = [
  { id: '1', name: 'Pantoprazole', strength: '40mg', timeOfDay: 'Morning', timeStr: '08:00 AM', instructions: 'Before Food', status: 'taken' },
  { id: '2', name: 'Metformin', strength: '500mg', timeOfDay: 'Morning', timeStr: '09:00 AM', instructions: 'After Food', status: 'taken' },
  { id: '3', name: 'Vitamin D3', strength: '60K IU', timeOfDay: 'Afternoon', timeStr: '01:00 PM', instructions: 'After Lunch', status: 'missed' },
  { id: '4', name: 'Metformin', strength: '500mg', timeOfDay: 'Night', timeStr: '09:00 PM', instructions: 'After Food', status: 'upcoming' },
];

export default function TimelinePage() {
  const groupedMeds = mockTimeline.reduce((acc, med) => {
    if (!acc[med.timeOfDay]) acc[med.timeOfDay] = [];
    acc[med.timeOfDay].push(med);
    return acc;
  }, {} as Record<TimeOfDay, TimelineMed[]>);

  const timePeriods: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <div className="flex-1 bg-[var(--color-paper)] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">Medication Timeline</h1>
          <p className="text-ink-light">Track your daily medication schedule and set reminders.</p>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)] mb-10 flex items-center justify-between">
          <Button variant="ghost" size="sm">Yesterday</Button>
          <div className="flex items-center gap-2 font-display font-bold text-ink text-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Today, Oct 1
          </div>
          <Button variant="ghost" size="sm">Tomorrow</Button>
        </div>

        <div className="space-y-10">
          {timePeriods.map(period => {
            const meds = groupedMeds[period];
            if (!meds || meds.length === 0) return null;

            return (
              <div key={period} className="relative">
                {/* Desktop vertical line */}
                <div className="absolute left-[130px] top-10 bottom-[-40px] w-px bg-[var(--color-border-light)] hidden md:block"></div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                  <div className="md:w-[100px] shrink-0 pt-2 flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 relative z-10">
                    <div className="md:hidden w-3 h-3 rounded-full bg-[var(--color-brand)] border-2 border-[var(--color-paper)]"></div>
                    <h3 className="font-display font-bold text-xl text-ink bg-[var(--color-paper)] md:py-2 md:pr-4">{period}</h3>
                  </div>

                  <div className="flex-1 space-y-4">
                    {meds.map(med => (
                      <div 
                        key={med.id} 
                        className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-start gap-4 transition-all ${
                          med.status === 'taken' ? 'bg-[var(--color-success-light)] border-[var(--color-success)]' :
                          med.status === 'missed' ? 'bg-signal-light border-signal' :
                          'bg-white border-[var(--color-border)] shadow-sm'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {med.status === 'taken' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-success)]">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          ) : med.status === 'missed' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-signal">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <h4 className="font-display font-bold text-ink text-lg">
                              {med.name}
                            </h4>
                            <span className="text-xs font-mono font-bold text-ink bg-[var(--color-paper-warm)] border border-[var(--color-border-light)] px-2 py-1 rounded-sm">
                              {med.timeStr}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-mono text-xs bg-[var(--color-brand-light)] text-brand px-1.5 py-0.5 rounded-sm">
                              {med.strength}
                            </span>
                            <span className="text-ink-light flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                              {med.instructions}
                            </span>
                          </div>
                        </div>

                        {med.status === 'upcoming' && (
                          <div className="mt-2 sm:mt-0">
                            <Button size="sm" className="w-full sm:w-auto">
                              Take Now
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
