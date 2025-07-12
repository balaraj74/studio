
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname, useRouter } from 'next/navigation';
import { Leaf, Bell, ArrowLeft } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();
  const router = useRouter();

  const renderMapWrapper = (content: React.ReactNode) => {
    if (apiKey) {
      return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{content}</Wrapper>
    }
    return content;
  }

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments.pop() || 'home';
    if (lastSegment === 'app') return "All Farms"; // Default page
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const isHomePage = pathname === '/dashboard';
  const pageTitle = getPageTitle();

  return (
    <div className="flex flex-col h-screen bg-background">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 shrink-0 border-b">
          <div className="flex items-center gap-2">
            {!isHomePage ? (
                <button onClick={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
            ) : (
                <div className="w-6" /> // Placeholder for alignment
            )}
            <h1 className="text-xl font-bold text-center flex-1">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 rounded-full hover:bg-muted">
                <Bell className="h-6 w-6" />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderMapWrapper(children)}
        </main>
        
        <nav className="sticky bottom-0 mt-auto border-t bg-background/95 backdrop-blur-sm z-10">
            <BottomNav />
        </nav>
    </div>
  );
}
