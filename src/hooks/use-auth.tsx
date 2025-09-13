
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/';
      if (!user && !isAuthPage) {
        router.push('/');
      }
      if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router, pathname]);

  if ((isLoading || !user) && pathname !== '/') {
    return null; // Let the loading.tsx handle the loading state
  }

  if (user && pathname === '/') {
    return null; // Return null for auth page if logged in
  }

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
