import { create } from 'zustand';
import { persist } from "zustand/middleware";

const useSessionStore = create(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      logout: () => set({ session: null }),
      getUser: () => get().session?.user,
      isAuthenticated: () => !!get().session
    }),
    {
      name: "sessionStorage",
    }
  )
);

export default useSessionStore;
