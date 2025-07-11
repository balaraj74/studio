
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { BottomNav } from "@/components/bottom-nav";
import { UserNav } from "@/components/user-nav";
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();

  const renderMapWrapper = (content: React.ReactNode) => {
    if (!apiKey) {
      // If no API key, just return the children. The pages will show an error message.
      return content;
    }
    // Load all possible libraries needed by the app at once.
    return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{content}</Wrapper>
  }

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    const title = segments[segments.length -1];
    if (pathname === '/dashboard') return "AgriSence";
    return title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAF4]">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-2">
            {pathname === '/dashboard' && <div className="p-2 bg-primary rounded-lg"><Leaf className="h-6 w-6 text-white" /></div>}
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </div>
          <UserNav />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {renderMapWrapper(children)}
        </main>
        
        <nav className="sticky bottom-0 mt-auto border-t bg-background/95 backdrop-blur-sm">
            <BottomNav />
        </nav>
    </div>
  );
}
