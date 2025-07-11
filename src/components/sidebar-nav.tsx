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
  DollarSign,
  Package,
  CloudSun,
  Stethoscope,
  LineChart,
  ScrollText,
  MessageCircle,
  Mic,
  MapPin,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crops", label: "Crops", icon: Leaf },
  { href: "/expenses", label: "Expenses", icon: DollarSign },
  { href: "/harvest", label: "Harvest", icon: Package },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/disease-check", label: "Diagnosis", icon: Stethoscope },
  { href: "/market", label: "Prices", icon: LineChart },
  { href: "/schemes", label: "Schemes", icon: ScrollText },
  { href: "/chatbot", label: "AI Chat", icon: MessageCircle },
  { href: "/voice", label: "Voice", icon: Mic },
  { href: "/fertilizer-finder", label: "Fertilizer Finder", icon: MapPin },
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
