import { useEffect, useState } from 'react';
import AuthApi from "#api/auth.js";
import {useAuthStore} from "#stores/useAuthStore.js";
import {useRouter} from "next/navigation";

const withAuth = (WrappedComponent) => {
    return (props) => {
        const { isLoggedIn, setUser } = useAuthStore();
        const router = useRouter();
        const [isHydrated, setIsHydrated] = useState(false); // Nouvel état pour l'hydratation

        useEffect(() => {
            setIsHydrated(true); // Le composant est monté côté client
        }, []);

        useEffect(() => {
            if (isHydrated) {
                if (!isLoggedIn()) {
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
