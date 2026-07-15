import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { USERS } from '../data/users';

interface AuthState {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (email, password) => {
        const user = USERS.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );
        if (!user) return false;
        set({ currentUser: user });
        return true;
      },
      loginAs: (userId) => {
        const user = USERS.find((u) => u.id === userId);
        if (user) set({ currentUser: user });
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'cih-auth' }
  )
);
