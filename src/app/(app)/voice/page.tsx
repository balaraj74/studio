"use client";

import { useState, useRef, useEffect } from "react";
import { farmingAdviceChatbot } from "@/ai/flows/farming-advice-chatbot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Languages, Mic, Bot, User, Volume2, Loader2 } from "lucide-react";

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        const supportedVoices = availableVoices.filter(
          (v) =>
            v.lang.startsWith("en") ||
            v.lang.startsWith("kn") ||
            v.lang.startsWith("hi")
        );
        setVoices(supportedVoices);
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
  }, []);

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.lang === lang);
      utterance.voice = selectedVoice || null;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: "destructive",
        title: "TTS Not Supported",
        description: "Your browser does not support text-to-speech.",
      });
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;

    setTranscript(text);
    setIsLoading(true);
    setResponse("");

    try {
      const result = await farmingAdviceChatbot({ question: text });
      setResponse(result.answer);
      handleSpeak(result.answer, selectedLanguage);
    } catch (error) {
      console.error("Error calling chatbot:", error);
      const errorMessage = "Sorry, I couldn't get a response. Please try again.";
      setResponse(errorMessage);
      handleSpeak(errorMessage, selectedLanguage);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Failed to get a response from the AI.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        variant: "destructive",
        title: "Voice Recognition Not Supported",
        description: "Your browser does not support voice recognition.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setResponse("");
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      toast({
        variant: "destructive",
        title: "Voice Recognition Error",
        description: event.error,
      });
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      processTranscript(spokenText);
    };

    setTimeout(() => recognition.start(), 100); // Add a small delay
    recognitionRef.current = recognition;
  };

  const languageOptions = [
    { value: "en-IN", label: "English (India)" },
    { value: "kn-IN", label: "Kannada" },
    { value: "hi-IN", label: "Hindi" },
  ];
  
  const getMicButtonText = () => {
      if (isListening) return "Listening...";
      if (isLoading) return "Processing...";
      return "Tap to Speak";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
            <Mic className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Voice Assistant</h1>
            <p className="text-muted-foreground">
            Interact with AgriSence using your voice.
            </p>
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Button
              size="lg"
              className={`relative h-24 w-24 rounded-full transition-colors ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
              onClick={handleMicClick}
              disabled={isLoading}
            >
              <Mic className="h-12 w-12" />
              {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping opacity-75"></span>}
            </Button>
          </div>
          <CardTitle className="text-2xl">{getMicButtonText()}</CardTitle>
          <CardDescription>
            Ask about crops, weather, or farming techniques.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(transcript || response || isLoading) && (
            <div className="text-left space-y-4 p-4 border rounded-lg bg-muted/50 min-h-[120px]">
              {transcript && (
                  <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                      <div>
                          <p className="font-semibold">You asked:</p>
                          <p className="text-muted-foreground">{transcript}</p>
                      </div>
                  </div>
              )}
              {isLoading && !response && (
                  <div className="flex items-center justify-center pt-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                  </div>
              )}
              {response && (
                  <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                      <div>
                          <p className="font-semibold">AgriSence says:</p>
                          <p className="text-muted-foreground">{response}</p>
                      </div>
                  </div>
              )}
            </div>
          )}
        </CardContent>
         {response && !isLoading && (
            <CardFooter className="justify-center">
                 <Button variant="outline" onClick={() => handleSpeak(response, selectedLanguage)}>
                    <Volume2 className="mr-2 h-4 w-4"/>
                    Listen Again
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
