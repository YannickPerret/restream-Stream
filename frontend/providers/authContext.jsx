import { createContext, useContext, useState, useEffect } from 'react';
import { useFetcher } from 'next/navigation';
const AuthContext = createContext({ isAuthenticated: false, setIsAuthenticated: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load('/api/check-auth')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      });
  }, [fetcher]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
  <div className="layout">
    {children}
    </div>
    </AuthContext.Provider>
);
}
