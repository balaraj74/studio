
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Leaf,
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  MessageCircle,
  Mic,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';

interface QuickLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const quickLinks: QuickLink[] = [
  {
    href: '/records',
    title: 'My Farm Records',
    description: 'Manage crops, expenses, and harvests.',
    icon: Leaf,
  },
  {
    href: '/disease-check',
    title: 'Crop Disease Check',
    description: 'Diagnose diseases from leaf images.',
    icon: Stethoscope,
  },
  {
    href: '/weather',
    title: 'Weather Forecast',
    description: 'Get location-based weather updates.',
    icon: CloudSun,
  },
  {
    href: '/market',
    title: 'Market Prices',
    description: 'View latest prices for major crops.',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Govt. Schemes',
    description: 'Find relevant agricultural schemes.',
    icon: ScrollText,
  },
];

const aiTools = [
    { href: '/chatbot', title: 'AI Chatbot', icon: MessageCircle },
    { href: '/voice', title: 'Voice Assistant', icon: Mic },
]

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Welcome, {user?.displayName?.split(' ')[0] || 'Farmer'}!
        </h1>
        <p className="text-muted-foreground">
          Here's a quick overview of your farm assistant.
        </p>
      </div>

      <WeatherWidget />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link href={link.href} key={link.href} className="block">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-all active:scale-[0.98]">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      
       <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
        <CardHeader>
            <CardTitle>AI-Powered Assistants</CardTitle>
            <CardDescription className="text-primary-foreground/80">Get instant help using text or voice.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            {aiTools.map(tool => (
                 <Button key={tool.href} asChild variant="secondary" className="justify-start gap-4 text-lg py-6 flex-1">
                    <Link href={tool.href}>
                        <tool.icon className="h-6 w-6" />
                        <span>{tool.title}</span>
                    </Link>
                </Button>
            ))}
        </CardContent>
       </Card>

    </div>
  );
}
