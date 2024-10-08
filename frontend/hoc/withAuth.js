import { useEffect, useState } from 'react';
import AuthApi from "#api/auth.js";
import { useAuthStore } from "#stores/useAuthStore.js";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const withAuth = (WrappedComponent) => {
    return (props) => {
        const { isLoggedIn, setUser, setRedirectAfterLogin } = useAuthStore();
        const router = useRouter();
        const pathname = usePathname();  // Utilise usePathname pour obtenir le chemin actuel
        const searchParams = useSearchParams();  // Utilise useSearchParams pour obtenir les paramètres d'URL
        const [isHydrated, setIsHydrated] = useState(false);

        useEffect(() => {
            setIsHydrated(true);
        }, []);

        useEffect(() => {
            if (isHydrated) {
                if (!isLoggedIn()) {
                    // Créer l'URL complète avec les paramètres
                    const redirectTo = `${pathname}?${searchParams.toString()}`;
                    setRedirectAfterLogin(redirectTo);  // Stocker l'URL complète
                    router.push('/auth/login');
                } else {
                    AuthApi.getCurrentUser().then((data) => {
                        setUser(data.user);
                    });
                }
            }
        }, [isHydrated]);

        if (!isHydrated) {
            return null;
        }

        return isLoggedIn() ? <WrappedComponent {...props} /> : null;
    };
};

export default withAuth;
