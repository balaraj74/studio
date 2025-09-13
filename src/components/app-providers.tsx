
"use client";

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Loading from '@/app/(app)/loading';

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This timer ensures the loading animation is shown for a bit.
    const timer = setTimeout(() => setLoading(false), 2000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Loading />}
      
      <div style={{ display: loading ? 'none' : 'block' }}>
        <div className="animated-bg" />
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </div>
    </>
  );
}
