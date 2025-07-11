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
  FileText,
  Map,
  LogOut,
  Cog,
  HelpCircle,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crops", label: "Crop Management", icon: Leaf },
  { href: "/expenses", label: "Expenses", icon: DollarSign },
  { href: "/harvest", label: "Harvest Records", icon: Package },
  { href: "/field-mapping", label: "Field Map", icon: Map },
  { href: "/disease-check", label: "Crop Diagnosis", icon: Stethoscope },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/market", label: "Market Prices", icon: LineChart },
  { href: "/schemes", label: "Govt. Schemes", icon: ScrollText },
  { href: "/land-records", label: "Land Records", icon: FileText },
];

const secondaryNavItems = [
    { href: "/chatbot", label: "AI Chatbot", icon: MessageCircle },
    { href: "/voice", label: "Voice Assistant", icon: Mic },
    { href: "/fertilizer-finder", label: "Fertilizer Finder", icon: MapPin },
]

const helpNavItems = [
    { href: "#", label: "Settings", icon: Cog },
    { href: "#", label: "Help & Support", icon: HelpCircle },
    { href: "#", label: "Logout", icon: LogOut },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
        <div>
            <SidebarMenu>
            {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="justify-start"
                >
                    <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-base font-medium">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
            <SidebarMenu className="mt-4">
                 {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="justify-start"
                >
                    <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-base font-medium">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </div>
        <SidebarMenu>
            {helpNavItems.map((item) => (
                 <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="justify-start"
                >
                    <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-base font-medium">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    </div>
  );
}
