"use client";

import { useUserStore } from '@/store/useUserStore';
import { User, Activity, AlertCircle, Save } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { profile, setProfile } = useUserStore();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    weight: profile?.weight || '',
    allergies: profile?.allergies?.join(', ') || '',
    chronicConditions: profile?.chronicConditions?.join(', ') || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      name: formData.name,
      age: formData.age,
      weight: formData.weight,
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      currentMedicines: profile?.currentMedicines || []
    });
    alert('Profile saved successfully! This data will be used to check for drug interactions.');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Medical Profile</h1>
        <p className="text-slate-600 mt-1">Manage your personal and medical details securely.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <section>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b">
            <User className="text-blue-500" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="e.g. 70"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b">
            <Activity className="text-purple-500" /> Medical Details
          </h2>
          
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3 border border-amber-100 text-sm">
            <AlertCircle className="shrink-0 mt-0.5 text-amber-600" size={18} />
            <p>
              This information is used strictly by our AI safety system to alert you of potential <strong>drug interactions or allergies</strong> when you scan new prescriptions. It is stored securely.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Known Allergies</label>
              <textarea 
                value={formData.allergies}
                onChange={e => setFormData({...formData, allergies: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none h-24"
                placeholder="e.g. Penicillin, Peanuts (comma separated)"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chronic Conditions</label>
              <textarea 
                value={formData.chronicConditions}
                onChange={e => setFormData({...formData, chronicConditions: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none h-24"
                placeholder="e.g. Hypertension, Type 2 Diabetes (comma separated)"
              ></textarea>
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-md flex items-center gap-2"
          >
            <Save size={18} /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
