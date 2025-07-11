
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Wrench, Bot, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/ai", label: "AI", icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="grid h-16 grid-cols-5 items-center gap-1 p-1 sm:gap-2 sm:p-2">
      {navItems.map((item) => {
        // A special check for the base path to not be active for all sub-routes
        const isCurrentlyActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);


        return (
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary",
              isCurrentlyActive && "text-primary bg-primary/10"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
