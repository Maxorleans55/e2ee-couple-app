import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface AppStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  partnerName: string;
  setPartnerName: (name: string) => void;
  safetyNumber: string | null;
  setSafetyNumber: (sn: string | null) => void;
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  partnerName: 'Partner',
  setPartnerName: (name) => set({ partnerName: name }),
  safetyNumber: null,
  setSafetyNumber: (sn) => set({ safetyNumber: sn }),
  isVerified: false,
  setIsVerified: (v) => set({ isVerified: v }),
}));
