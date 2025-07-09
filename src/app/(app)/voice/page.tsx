import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function VoicePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Card className="w-full max-w-lg p-8">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Mic className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Voice Assistant</CardTitle>
          <CardDescription>
            This feature is coming soon. Interact with AgriSence using your voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Stay tuned for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}
