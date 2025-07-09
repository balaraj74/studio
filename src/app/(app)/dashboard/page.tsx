import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Leaf,
  BarChart2,
  DollarSign,
  Package,
  CloudSun,
  Stethoscope,
  ArrowRight,
  LineChart,
  ScrollText,
  MessageCircle,
  Mic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const tools: Tool[] = [
   {
    title: "Crop Management",
    description: "Track your crops from sowing to harvest in one place.",
    href: "/crops",
    icon: Leaf,
    color: "text-green-700",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Expense Tracking",
    description: "Monitor costs and manage your farm's budget.",
    href: "/expenses",
    icon: DollarSign,
    color: "text-yellow-700",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Harvest Records",
    description: "Log your yields, track production, and manage inventory.",
    href: "/harvest",
    icon: Package,
    color: "text-orange-700",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Crop Diagnosis",
    description: "Detect crop diseases using your phone's camera.",
    href: "/disease-check",
    icon: Stethoscope,
    color: "text-red-700",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Weather Tracking",
    description: "Get accurate forecasts to plan your activities.",
    href: "/weather",
    icon: CloudSun,
    color: "text-sky-700",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Market Prices",
    description: "View latest APMC prices for key crops in your region.",
    href: "/market",
    icon: LineChart,
    color: "text-blue-700",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Govt. Schemes",
    description: "Discover and apply for relevant government schemes.",
    href: "/schemes",
    icon: ScrollText,
    color: "text-indigo-700",
    bgColor: "bg-indigo-500/10",
  },
   {
    title: "AI Chatbot",
    description: "Ask farming questions and get instant expert advice.",
    href: "/chatbot",
    icon: MessageCircle,
    color: "text-purple-700",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Voice Assistant",
    description: "Interact with the app using voice commands.",
    href: "/voice",
    icon: Mic,
    color: "text-pink-700",
    bgColor: "bg-pink-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="p-8 rounded-lg bg-card border shadow-sm">
        <h1 className="text-3xl font-bold font-headline text-foreground">Welcome back, Farmer!</h1>
        <p className="text-muted-foreground mt-2">
          Here's a quick overview of your farm. Let's make today a productive one.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="font-bold">
            <Link href="/chatbot">
              Ask AI Assistant
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/crops">
              Manage My Crops
            </Link>
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Your Farming Toolkit</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card
              key={tool.href}
              className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color}`}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full" variant="outline">
                  <Link href={tool.href}>
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
