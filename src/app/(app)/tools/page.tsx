
'use client';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  FileText,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const toolItems: ToolItem[] = [
  {
    href: '/disease-check',
    title: 'Crop Diagnosis',
    description: 'Identify crop diseases from images.',
    icon: Stethoscope,
  },
  {
    href: '/weather',
    title: 'Weather Forecast',
    description: 'Get real-time weather information.',
    icon: CloudSun,
  },
  {
    href: '/market',
    title: 'Market Prices',
    description: 'Track prices of key crops by region.',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Government Schemes',
    description: 'Find relevant agricultural schemes.',
    icon: ScrollText,
  },
  {
    href: '/land-records',
    title: 'Land Records',
    description: 'Access official land record portals.',
    icon: FileText,
  },
  {
    href: '/fertilizer-finder',
    title: 'Fertilizer Finder',
    description: 'Locate nearby fertilizer shops.',
    icon: MapPin,
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-4">
      {toolItems.map((item) => (
        <Link href={item.href} key={item.href} className="block">
          <Card className="hover:bg-muted/50 active:scale-[0.98] transition-all">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-primary/10 rounded-lg">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
