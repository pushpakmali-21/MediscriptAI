"use client";

import { useUserStore } from '@/store/useUserStore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { profile, setProfile } = useUserStore();
  const [isClient, setIsClient] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    weight: profile?.weight || '',
    allergies: profile?.allergies?.join(', ') || '',
    chronicConditions: profile?.chronicConditions?.join(', ') || '',
  });

  useEffect(() => {
    setIsClient(true);
    setFormData({
      name: profile?.name || '',
      age: profile?.age || '',
      weight: profile?.weight || '',
      allergies: profile?.allergies?.join(', ') || '',
      chronicConditions: profile?.chronicConditions?.join(', ') || '',
    });
  }, [profile]);

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
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!isClient) return null;

  return (
    <div className="flex-1 bg-[var(--color-paper)] px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink">Medical Profile</h1>
          <p className="text-ink-light mt-1">Manage your personal and medical details securely.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-[var(--color-border)]">
          
          <section>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border-light)]">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm bg-[var(--color-paper-warm)] text-ink"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm bg-[var(--color-paper-warm)] text-ink"
                    placeholder="e.g. 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm bg-[var(--color-paper-warm)] text-ink"
                    placeholder="e.g. 70"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border-light)]">
              Medical Details
            </h2>
            
            <div className="bg-[var(--color-brand-light)] text-brand-dark p-4 rounded-lg mb-6 border border-brand/20 text-sm flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>
                This information is used strictly by our AI safety system to alert you of potential <strong>drug interactions or allergies</strong> when you scan new prescriptions. It is stored securely on your device.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Known Allergies</label>
                <textarea 
                  value={formData.allergies}
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm bg-[var(--color-paper-warm)] text-ink resize-none h-24"
                  placeholder="e.g. Penicillin, Peanuts (comma separated)"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Chronic Conditions</label>
                <textarea 
                  value={formData.chronicConditions}
                  onChange={e => setFormData({...formData, chronicConditions: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-[var(--color-border)] rounded-md shadow-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm bg-[var(--color-paper-warm)] text-ink resize-none h-24"
                  placeholder="e.g. Hypertension, Type 2 Diabetes (comma separated)"
                ></textarea>
              </div>
            </div>
          </section>

          <div className="pt-4 flex items-center justify-end gap-4">
            {isSaved && (
              <span className="text-sm font-medium text-[var(--color-success)] flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Profile saved
              </span>
            )}
            <Button type="submit">
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
