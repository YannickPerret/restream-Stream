import { create } from 'zustand';
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            subscriptions: null,
            isAuthenticated: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setSubscriptions: (subscriptions) => set({ subscriptions }),

            logout: () => {
                console.log("ddd")
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
            },

            isLoggedIn: () => !!get().token,
        }),
        {
            name: "authToken",
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
