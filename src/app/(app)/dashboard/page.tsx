import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Leaf,
  CloudSun,
  Stethoscope,
  ArrowRight,
  LineChart,
  ScrollText,
  MessageCircle,
  Map,
  DollarSign,
  Package
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const tools: Tool[] = [
   {
    title: "Crop Management",
    description: "Track your crops from sowing to harvest.",
    href: "/crops",
    icon: Leaf,
  },
  {
    title: "Field Mapping",
    description: "Draw your field boundaries and measure area.",
    href: "/field-mapping",
    icon: Map,
  },
  {
    title: "Crop Diagnosis",
    description: "Detect crop diseases using your phone's camera.",
    href: "/disease-check",
    icon: Stethoscope,
  },
  {
    title: "Weather Tracking",
    description: "Get accurate forecasts to plan your activities.",
    href: "/weather",
    icon: CloudSun,
  },
  {
    title: "Market Prices",
    description: "View latest prices for key crops in your region.",
    href: "/market",
    icon: LineChart,
  },
  {
    title: "Govt. Schemes",
    description: "Discover and apply for relevant government schemes.",
    href: "/schemes",
    icon: ScrollText,
  },
   {
    title: "AI Chatbot",
    description: "Ask farming questions and get instant expert advice.",
    href: "/chatbot",
    icon: MessageCircle,
  },
  {
    title: "Expense Tracking",
    description: "Monitor costs and manage your farm's budget.",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    title: "Harvest Records",
    description: "Log your yields, track production, and manage inventory.",
    href: "/harvest",
    icon: Package,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Good Morning, Farmer!</h1>
        <p className="text-muted-foreground">
          Here is your farm's performance and operations summary.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Production Overview</CardTitle>
                <CardDescription>A summary of your farm's production.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="h-60 w-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Production Chart Placeholder</p>
                </div>
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Weather</CardTitle>
                    <CardDescription>Current conditions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CloudSun className="h-12 w-12 text-yellow-500" />
                            <div>
                                <p className="text-4xl font-bold">24°C</p>
                                <p className="text-muted-foreground">Cloudy</p>
                            </div>
                        </div>
                         <Button asChild variant="outline">
                            <Link href="/weather">View Details</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Vegetable Harvest Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p>Tomatoes</p>
                        <p className="font-semibold">150 tons</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p>Carrots</p>
                        <p className="font-semibold">120 tons</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p>Corn</p>
                        <p className="font-semibold">200 tons</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {tools.map((tool) => (
            <Card
              key={tool.href}
              className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                    <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary`}
                    >
                    <tool.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
