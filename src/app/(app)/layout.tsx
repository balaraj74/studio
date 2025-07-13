
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { usePathname } from 'next/navigation';
import { AgrisenceLogo } from '@/components/agrisence-logo';
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";

const MAPS_PAGES = ['/fertilizer-finder', '/field-mapping'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();

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
    <div className="flex flex-col h-dvh bg-background">
      <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2">
            <AgrisenceLogo className="h-8 w-auto" />
            <span className="text-xl font-semibold">AgriSence</span>
        </Link>
        <TopNav />
        <UserNav />
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
        {renderContent()}
      </main>
      <BottomNav />
    </div>
  );
}
