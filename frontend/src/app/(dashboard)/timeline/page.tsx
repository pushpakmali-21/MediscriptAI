"use client";

import { Calendar, CheckCircle2, Clock, Info } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Medication Timeline</h1>
        <p className="text-slate-600 mt-1">Track your daily medication schedule and set reminders.</p>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center justify-between">
        <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Yesterday</button>
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Calendar className="text-blue-600" />
          Today, Oct 1
        </div>
        <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Tomorrow</button>
      </div>

      <div className="space-y-8">
        {timePeriods.map(period => {
          const meds = groupedMeds[period];
          if (!meds || meds.length === 0) return null;

          return (
            <div key={period} className="relative pl-6 md:pl-0">
              {/* Timeline line */}
              <div className="absolute left-[11px] md:left-[120px] top-8 bottom-[-32px] w-0.5 bg-slate-200 hidden md:block"></div>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <div className="md:w-[100px] shrink-0 pt-4 flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center relative z-10 text-blue-600 md:hidden">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{period}</h3>
                </div>

                <div className="flex-1 space-y-4">
                  {meds.map(med => (
                    <div 
                      key={med.id} 
                      className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                        med.status === 'taken' ? 'bg-emerald-50 border-emerald-100' :
                        med.status === 'missed' ? 'bg-red-50 border-red-100' :
                        'bg-white border-slate-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="mt-1">
                        {med.status === 'taken' ? <CheckCircle2 className="text-emerald-500" size={24} /> :
                         med.status === 'missed' ? <Clock className="text-red-500" size={24} /> :
                         <Clock className="text-slate-400" size={24} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 text-lg">
                            {med.name} <span className="text-slate-500 font-medium text-sm ml-1">{med.strength}</span>
                          </h4>
                          <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                            {med.timeStr}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm flex items-center gap-1.5 mt-2">
                          <Info size={14} className="text-slate-400" /> {med.instructions}
                        </p>
                      </div>

                      {med.status === 'upcoming' && (
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shrink-0">
                          Take Now
                        </button>
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
  );
}
