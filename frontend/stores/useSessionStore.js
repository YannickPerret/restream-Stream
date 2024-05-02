import { create } from 'zustand';
import { persist } from "zustand/middleware";

export const useSessionStore = create(
  persist((set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      logout: () => set((state) => ({ ...state, session:undefined })),
      getUser: () => get().session?.user,
      isAuthenticated: () => !!get().session
    }), {
    name: "sessionStorage",
  })
);