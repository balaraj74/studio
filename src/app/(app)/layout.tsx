"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { Wrapper } from "@googlemaps/react-wrapper";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const renderMapWrapper = (content: React.ReactNode) => {
    if (!apiKey) {
      // If no API key, just return the children. The pages will show an error message.
      return content;
    }
    return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{content}</Wrapper>
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="bg-sidebar-primary p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">AgriSence</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
            {/* Can add items here later if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderMapWrapper(children)}</main>
        <footer className="w-full border-t p-4 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgriSence. All rights reserved.
            </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
