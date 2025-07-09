"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Leaf, Bot, Sun, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-headline font-semibold text-primary">{title}</h3>
        <p className="mt-1 text-sm text-foreground/80">{description}</p>
    </div>
);


export default function SignInPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // The useEffect will handle the redirect
    } catch (error: any) {
      console.error("Sign in failed", error);
      let description = "Could not sign in. Check your Firebase project settings: ensure Google Sign-In is enabled and this domain is authorized.";
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            description = "The sign-in popup was closed before completing. Please try again.";
            break;
          case 'auth/cancelled-popup-request':
            description = "The sign-in process was cancelled. Please try again.";
            break;
          case 'auth/popup-blocked':
            description = "The sign-in popup was blocked by your browser. Please allow popups and try again.";
            break;
          case 'auth/operation-not-allowed':
             description = "Sign-in with Google is not enabled for this app. Please enable it in your Firebase project's Authentication settings.";
             break;
          case 'auth/invalid-api-key':
            description = "The Firebase API key is not valid. Please check your .env file."
            break;
        }
      }
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description,
        duration: 9000,
      });
      setIsSigningIn(false);
    }
  };
  
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 sm:py-24">
          <div className="text-center">
            <h1 className="flex items-center justify-center text-5xl md:text-6xl font-bold font-headline text-primary">
              <Leaf className="mr-3 h-12 w-12" />
              AgriSence
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              Your AI-powered assistant for modern farming in India. Get insights on crop health, expert advice, and market data, all in one place.
            </p>
            <div className="mt-8">
              <Button onClick={handleSignIn} disabled={isSigningIn} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
                  {isSigningIn ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      Sign In with Google
                    </>
                  )}
              </Button>
            </div>
          </div>

          <div className="mt-24">
            <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
              <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                   <FeatureCard 
                    icon={<Leaf size={24}/>} 
                    title="Disease Detection" 
                    description="Instantly identify crop diseases from a leaf's photo." 
                  />
                  <FeatureCard 
                    icon={<Bot size={24}/>} 
                    title="AI Chatbot" 
                    description="Ask any farming question and get expert advice." 
                  />
                  <FeatureCard 
                    icon={<Sun size={24}/>} 
                    title="Weather Forecasts" 
                    description="Real-time local weather to plan your activities." 
                  />
                   <FeatureCard 
                    icon={<IndianRupee size={24}/>} 
                    title="Market Prices" 
                    description="Track crop prices to sell at the right time." 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="w-full py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Contact: <a href="mailto:balarajr83@gmail.com" className="underline hover:text-primary">balarajr83@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}