import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  name: string;
  age: string;
  weight: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedicines: string[];
}

interface UserState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  language: string;
  theme: 'light' | 'dark' | 'system';
  setAuth: (status: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      profile: null,
      language: 'en',
      theme: 'system',
      setAuth: (status) => set({ isAuthenticated: status }),
      setProfile: (profile) => set({ profile }),
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
      logout: () => set({ isAuthenticated: false, profile: null }),
    }),
    {
      name: 'mediscript-user-storage',
    }
  )
);
