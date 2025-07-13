"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BrainCircuit, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: ClipboardList },
  { href: "/tools", label: "Tools", icon: BrainCircuit },
  { href: "/ai", label: "AI Hub", icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t border-white/10 bg-background/80 p-2 backdrop-blur-sm md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navItems.map((item) => {
             const isActive =
                item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

            return (
                <Link
                    href={item.href}
                    key={item.href}
                    className={cn(
                        "group inline-flex flex-col items-center justify-center px-5 rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                        isActive && "text-accent"
                    )}
                >
                    <item.icon className={cn("h-6 w-6 mb-1", isActive && "text-accent")} />
                    <span className="text-xs">{item.label}</span>
                </Link>
            )
        })}
      </div>
    </nav>
  );
}
