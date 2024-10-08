import { create } from 'zustand';
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            subscriptions: null,
            isAuthenticated: false,
            redirectAfterLogin: null,  // Ajout du champ pour gérer la redirection

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setSubscriptions: (subscriptions) => set({ subscriptions }),

            // Ajout de la fonction pour définir la redirection
            setRedirectAfterLogin: (redirectTo) => set({ redirectAfterLogin: redirectTo }),

            // Ajout de la fonction pour récupérer et réinitialiser la redirection
            clearRedirectAfterLogin: () => {
                const redirect = get().redirectAfterLogin;
                set({ redirectAfterLogin: null });  // Réinitialise après récupération
                return redirect;
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    redirectAfterLogin: null,  // On réinitialise aussi la redirection à la déconnexion
                });
            },

            isLoggedIn: () => !!get().token,
            isAdmin: () => {
                const user = get().user;
                return user && user.role.name === 'admin';
            },
        }),
        {
            name: "authToken",
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                redirectAfterLogin: state.redirectAfterLogin  // Persistance du redirect
            }),
        }
    )
);
