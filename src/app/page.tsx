
"use client"

import { useState } from 'react';
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from "@/hooks/use-toast";

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
    <title>Google</title>
    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-3.83 0-6.97-3.14-6.97-7s3.14-7 6.97-7c2.2 0 3.58.88 4.43 1.69l2.5-2.5C18.17 2.09 15.63 1 12.48 1 7.23 1 3.06 4.9 3.06 10s4.17 9 9.42 9c2.8 0 5.2-1 6.9-2.83 1.79-1.83 2.34-4.59 2.34-6.57 0-.54-.05-.98-.12-1.4z"/>
  </svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setIsLoading(true);
    const email = action === 'signIn' ? signInEmail : signUpEmail;
    const password = action === 'signIn' ? signInPassword : signUpPassword;

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Email and password cannot be empty.',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (action === 'signUp') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // The auth provider will handle the redirect
    } catch (error: any) {
      const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-primary rounded-xl mb-3">
            <Leaf className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-primary">AgriSence</h1>
          <p className="text-muted-foreground mt-1">Your AI-powered agriculture assistant</p>
        </div>
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">Email</Label>
                  <Input id="email-in" type="email" placeholder="farmer@example.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} disabled={isLoading || isGoogleLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-in">Password</Label>
                  <Input id="password-in" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} disabled={isLoading || isGoogleLoading}/>
                </div>
                <Button onClick={() => handleAuthAction('signIn')} className="w-full font-bold" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Join our community to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" placeholder="farmer@example.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} disabled={isLoading || isGoogleLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Password</Label>
                  <Input id="password-up" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} disabled={isLoading || isGoogleLoading}/>
                </div>
                <Button onClick={() => handleAuthAction('signUp')} className="w-full font-bold" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
          {isGoogleLoading ? <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <GoogleIcon />}
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>
    </div>
  );
}
