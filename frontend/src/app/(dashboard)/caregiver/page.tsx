"use client";

import { Users, UserPlus, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CaregiverPage() {
  const dependents = [
    { name: 'Mary Doe', relation: 'Mother', age: 68, upcomingMeds: 2, criticalAlerts: 0 },
    { name: 'Robert Doe', relation: 'Father', age: 72, upcomingMeds: 1, criticalAlerts: 1 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-blue-600" size={32} /> Caregiver Mode
          </h1>
          <p className="text-slate-600 mt-1">Manage and monitor medication schedules for your dependents.</p>
        </div>
        <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <UserPlus size={18} /> Add Dependent
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {dependents.map((dep, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{dep.name}</h3>
                <p className="text-sm text-slate-500">{dep.relation} • {dep.age} years old</p>
              </div>
              <Link href={`/dashboard?dependent=${dep.name}`} className="text-blue-600 text-sm font-medium hover:underline">
                View Dashboard
              </Link>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-1 text-center">
                <Clock className="mx-auto text-blue-500 mb-1" size={20} />
                <div className="font-bold text-lg text-blue-900">{dep.upcomingMeds}</div>
                <div className="text-xs text-blue-700">Upcoming Meds</div>
              </div>
              <div className={`p-3 rounded-xl flex-1 text-center border ${dep.criticalAlerts > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <AlertTriangle className={`mx-auto mb-1 ${dep.criticalAlerts > 0 ? 'text-amber-500' : 'text-slate-400'}`} size={20} />
                <div className={`font-bold text-lg ${dep.criticalAlerts > 0 ? 'text-amber-900' : 'text-slate-700'}`}>{dep.criticalAlerts}</div>
                <div className={`text-xs ${dep.criticalAlerts > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Safety Alerts</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Today&apos;s Schedule (Preview)</h4>
              <div className="space-y-2">
                 <div className="flex justify-between text-sm p-2 bg-slate-50 rounded-lg">
                   <span className="font-medium text-slate-800">Amlodipine 5mg</span>
                   <span className="text-emerald-600 font-medium">Taken (8:00 AM)</span>
                 </div>
                 <div className="flex justify-between text-sm p-2 bg-white border border-slate-100 rounded-lg">
                   <span className="font-medium text-slate-800">Atorvastatin 20mg</span>
                   <span className="text-slate-500">Upcoming (8:00 PM)</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
