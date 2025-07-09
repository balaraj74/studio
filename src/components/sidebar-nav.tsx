"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Leaf,
  MessageCircle,
  ScrollText,
  CloudSun,
  LineChart,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/disease-check", label: "Disease Check", icon: Leaf },
  { href: "/chatbot", label: "AI Chatbot", icon: MessageCircle },
  { href: "/schemes", label: "Schemes", icon: ScrollText },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/market", label: "Market Prices", icon: LineChart },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
