
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { UserNav } from "@/components/user-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();

  const renderMapWrapper = (content: React.ReactNode) => {
    if (apiKey) {
      return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{content}</Wrapper>
    }
    // Add a fallback for when the API key is not available
    if (pathname === '/fertilizer-finder' || pathname === '/field-mapping') {
        return <div className="text-center text-red-500">Google Maps API key is not configured. This feature is unavailable.</div>
    }
    return content;
  }
  
  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Dashboard";
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return "AgriSence";
    // Capitalize the first letter of each word in the last segment
    return segments[segments.length-1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline">{getPageTitle()}</h1>
        </div>
        <UserNav />
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderMapWrapper(children)}
      </main>
      <nav className="sticky bottom-0 mt-auto border-t bg-background/95 backdrop-blur-sm z-10 md:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
