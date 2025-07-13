"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from "@/hooks/use-toast";
import { AgrisenceLogo } from '@/components/agrisence-logo';
import Image from 'next/image';

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
    <title>Google</title>
    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-3.83 0-6.97-3.14-6.97-7s3.14-7 6.97-7c2.2 0 3.58.88 4.43 1.69l2.5-2.5C18.17 2.09 15.63 1 12.48 1 7.23 1 3.06 4.9 3.06 10s4.17 9 9.42 9c2.8 0 5.2-1 6.9-2.83 1.79-1.83 2.34-4.59 2.34-6.57 0-.54-.05-.98-.12-1.4z"/>
  </svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      // The auth provider will handle the redirect on success.
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred.';
      if (error.code) {
          switch (error.code) {
              case 'auth/popup-closed-by-user':
                  errorMessage = 'Sign-in window was closed before completion.';
                  break;
              case 'auth/cancelled-popup-request':
                  errorMessage = 'Multiple sign-in windows were opened. Please try again.';
                  break;
              case 'auth/unauthorized-domain':
                  errorMessage = 'This domain is not authorized for sign-in. Please contact support.';
                  break;
              default:
                  errorMessage = error.code.replace('auth/', '').replace(/-/g, ' ');
                  break;
          }
      }
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Error',
        description: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh p-8 bg-background">
        
        <div className="z-20 flex flex-col items-center text-center space-y-8 max-w-sm w-full">
            <AgrisenceLogo className="h-20 w-20" />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome to AgriSence
                </h1>
                <p className="text-base text-muted-foreground">
                    Your AI partner in modern farming.
                </p>
            </div>
             <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full"
                disabled={isGoogleLoading}
            >
                {isGoogleLoading ? (
                  <>
                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
            </Button>
        </div>
    </main>
  );
}
