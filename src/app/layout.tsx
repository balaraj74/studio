import type { Metadata, Viewport } from 'next';
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
};

export const viewport: Viewport = {
  themeColor: '#74B72E',
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
         <meta name="google-site-verification" content="w70z_ATdIg4qVVOUaY_qEugfjiWapembai-9s-AVzBM" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="animated-bg" />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
