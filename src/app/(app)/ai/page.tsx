'use client';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { MessageCircle, Mic, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AiItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const aiItems: AiItem[] = [
  {
    href: '/chatbot',
    title: 'AI Farming Chatbot',
    description: 'Get instant, text-based farming advice.',
    icon: MessageCircle,
  },
  {
    href: '/voice',
    title: 'Voice Assistant',
    description: 'Interact with AgriSence using your voice.',
    icon: Mic,
  },
];

export default function AiPage() {
  return (
    <div className="space-y-4">
      {aiItems.map((item) => (
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
