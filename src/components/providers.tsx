
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';

// This component is not strictly necessary with the current app structure
// but is kept for potential future providers.
// The primary providers (Auth, Theme) are handled in the respective layout files.
export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </AuthProvider>
    );
}
