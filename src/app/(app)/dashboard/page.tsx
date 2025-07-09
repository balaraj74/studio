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
  MessageCircle,
  ScrollText,
  CloudSun,
  LineChart,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Crop Disease Check",
    description: "Upload a leaf image to instantly diagnose plant diseases.",
    href: "/disease-check",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "AI Farming Chatbot",
    description: "Ask any farming-related question and get expert advice.",
    href: "/chatbot",
    icon: MessageCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Government Schemes",
    description: "Discover and filter schemes from central and state governments.",
    href: "/schemes",
    icon: ScrollText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Local Weather Forecast",
    description: "Get real-time weather updates to plan your farm activities.",
    href: "/weather",
    icon: CloudSun,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Market Prices",
    description: "Track the latest prices for key crops in your region.",
    href: "/market",
    icon: LineChart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to AgriSence! Here's your agricultural overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.href}
            className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  Go to {feature.title.split(' ')[0]}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
