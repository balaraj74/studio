"use client"

import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-3.83 0-6.97-3.14-6.97-7s3.14-7 6.97-7c2.2 0 3.58.88 4.43 1.69l2.5-2.5C18.17 2.09 15.63 1 12.48 1 7.23 1 3.06 4.9 3.06 10s4.17 9 9.42 9c2.8 0 5.2-1 6.9-2.83 1.79-1.83 2.34-4.59 2.34-6.57 0-.54-.05-.98-.12-1.4z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();

  const handleAuthAction = () => {
    // In a real app, this would handle actual authentication
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <Leaf className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-2 font-headline">AgriSence</h1>
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
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">Email</Label>
                  <Input id="email-in" type="email" placeholder="farmer@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-in">Password</Label>
                  <Input id="password-in" type="password" />
                </div>
                <Button onClick={handleAuthAction} className="w-full font-bold bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" placeholder="farmer@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Password</Label>
                  <Input id="password-up" type="password" />
                </div>
                <Button onClick={handleAuthAction} className="w-full font-bold bg-primary hover:bg-primary/90">
                  Sign Up
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
        <Button variant="outline" className="w-full" onClick={handleAuthAction}>
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
