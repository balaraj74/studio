import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Leaf } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'AgriSence - AI Farming Assistant',
  description: 'AI-powered agriculture assistant for Indian farmers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold font-headline text-primary">AgriSence</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter>
              {/* UserNav removed */}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1" />
              {/* UserNav removed */}
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
            <footer className="w-full border-t p-4 text-center">
               <p className="text-sm text-muted-foreground">
                  Contact: <a href="mailto:balarajr83@gmail.com" className="underline hover:text-primary">balarajr83@gmail.com</a>
              </p>
            </footer>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
