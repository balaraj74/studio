
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { UserNav } from "@/components/user-nav";

const MAPS_PAGES = ['/fertilizer-finder', '/field-mapping'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();

  // Conditionally wrap pages that need Google Maps
  const needsMapWrapper = MAPS_PAGES.includes(pathname);

  const renderContent = () => {
    if (needsMapWrapper) {
      if (apiKey) {
        return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{children}</Wrapper>;
      }
      return (
        <div className="text-center text-red-500 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
          Google Maps API key is not configured. This feature is unavailable.
        </div>
      );
    }
    return children;
  }

  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline">Agrisence</h1>
        </div>
        <UserNav />
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <nav className="sticky bottom-0 mt-auto border-t bg-background/95 backdrop-blur-sm z-10 md:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
