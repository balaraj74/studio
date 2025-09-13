
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
      if (!user) {
        // If not loading and no user, redirect to login
        router.push('/');
      }
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading || !user) {
    // While loading or if there's no user, we let the suspense boundary (loading.tsx) show.
    // By returning null, we prevent the children (the actual page) from rendering.
    return null; 
  }

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // This ensures the loading animation is visible for a minimum duration
      // creating a smoother user experience.
      setTimeout(() => {
        setUser(user);
        setIsLoading(false);
      }, 1500); // Minimum 1.5 second loading time
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
