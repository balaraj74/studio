import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter' 
});

export const metadata: Metadata = {
  title: 'AgriSence - AI Farming Assistant',
  description: 'AI-powered agriculture assistant for Indian farmers',
  manifest: '/manifest.json',
  themeColor: '#74B72E', // Updated to primary green
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="animated-bg" />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
