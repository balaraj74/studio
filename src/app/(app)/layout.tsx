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
import { UserNav } from "@/components/user-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">AgriSence</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
        <footer className="w-full border-t p-4 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgriSence. All rights reserved.
            </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
