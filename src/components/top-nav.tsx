
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BrainCircuit, Bot, Leaf, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: ClipboardList },
  { href: "/tools", label: "Tools", icon: BrainCircuit },
  { href: "/ai", label: "AI Hub", icon: Bot },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
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
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                )}
            >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
            </Link>
            );
        })}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Home className="h-5 w-5" />
                        <span className="sr-only">Open navigation</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                    <SheetHeader>
                         <SheetTitle className="sr-only">Agrisence Menu</SheetTitle>
                         <div className="flex items-center gap-2 p-2 mb-4 border-b">
                            <Leaf className="h-7 w-7 text-primary" />
                            <h1 className="text-xl font-bold font-headline">Agrisence</h1>
                        </div>
                    </SheetHeader>

                    <nav className="flex flex-col gap-2">
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
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isActive && "bg-muted text-primary"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-base font-medium">{item.label}</span>
                            </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    </>
  );
}
