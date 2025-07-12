
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/all-farms", label: "All Farms", icon: Grid3x3 },
  { href: "/statistic", label: "Statistic", icon: BarChart2 },
  { href: "/profile", label: "My Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="grid h-20 grid-cols-4 items-center gap-1 p-1 sm:gap-2 sm:p-2">
      {navItems.map((item) => {
        const isCurrentlyActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-colors",
              isCurrentlyActive && "text-primary font-bold"
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
            {isCurrentlyActive && <div className="h-1 w-1 bg-primary rounded-full mt-1" />}
          </Link>
        );
      })}
    </div>
  );
}
