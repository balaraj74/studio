
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BrainCircuit, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: ClipboardList },
  { href: "/tools", label: "Tools", icon: BrainCircuit },
  { href: "/ai", label: "AI Hub", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 md:hidden">
      <nav className="h-20 border border-white/10 bg-background/80 p-2 backdrop-blur-lg rounded-full">
        <div className="grid h-full grid-cols-5 mx-auto">
          {navItems.map((item) => {
              const isActive =
                  (item.href === '/dashboard' && pathname === item.href) ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                  <Link
                      href={item.href}
                      key={item.href}
                      className={cn(
                          "group inline-flex flex-col items-center justify-center p-2 rounded-full transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                      )}
                  >
                      <item.icon className={cn("h-7 w-7 mb-0.5 transition-all", isActive && "text-primary scale-110")} />
                      {/* <span className="text-xs">{item.label}</span> */}
                  </Link>
              )
          })}
        </div>
      </nav>
    </div>
  );
}
