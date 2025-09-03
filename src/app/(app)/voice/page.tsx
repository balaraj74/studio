
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Languages, Mic, Bot, User, Volume2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

type PermissionState = 'idle' | 'prompting' | 'granted' | 'denied';

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Initialize Speech Recognition once
  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported by your browser.");
      setPermissionState('denied');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event: any) => {
      let errorMessage = "An unknown error occurred.";
      if (event.error === 'no-speech') errorMessage = 'No speech was detected. Please try again.';
      else if (event.error === 'audio-capture') errorMessage = 'Microphone is busy or not found.';
      else if (event.error === 'not-allowed') errorMessage = 'Microphone access was denied by the browser.';
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      processTranscript(spokenText);
    };

    recognitionRef.current = recognition;
  }, [selectedLanguage]);

  // Load TTS voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const handleRequestPermission = async () => {
    setPermissionState('prompting');
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      toast({ title: "Microphone Enabled", description: "You can now use the voice assistant." });
    } catch (err) {
      setError("Permission denied. Please allow microphone access in your browser's settings.");
      setPermissionState('denied');
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current || isListening) {
      return;
    }
    setTranscript("");
    setResponse("");
    setError(null);
    try {
        recognitionRef.current.start();
    } catch (e) {
        setError("Could not start listening. Please try again.");
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
      const errorMessage = "Sorry, I couldn't get a response. Please try again.";
      setResponse(errorMessage);
      handleSpeak(errorMessage, selectedLanguage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.lang === lang);
      utterance.voice = selectedVoice || null;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMicButtonText = () => {
    if (isListening) return "Listening...";
    if (isLoading) return "Processing...";
    return "Tap to Speak";
  };

  const languageOptions = [
    { value: "en-IN", label: "English (India)" },
    { value: "kn-IN", label: "Kannada" },
    { value: "hi-IN", label: "Hindi" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg"><Mic className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Voice Assistant</h1>
          <p className="text-muted-foreground">Interact with AgriSence using your voice.</p>
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          {permissionState === 'granted' && (
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
          )}
          <CardTitle className="text-2xl">
            {permissionState === 'granted' ? getMicButtonText() : "Microphone Access"}
          </CardTitle>
          <CardDescription>
            {permissionState === 'granted' ? "Ask about crops, weather, or farming techniques." : "Please enable your microphone to use the voice assistant."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissionState !== 'granted' && (
             <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <Button onClick={handleRequestPermission} disabled={permissionState === 'prompting' || permissionState === 'denied'}>
                    <ShieldCheck className="mr-2 h-4 w-4"/>
                    {permissionState === 'prompting' ? 'Waiting for permission...' : 'Enable Microphone'}
                </Button>
            </div>
          )}
          
          <div className="flex justify-center items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Language" /></SelectTrigger>
              <SelectContent>
                {languageOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Voice Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(transcript || response || isLoading) && permissionState === 'granted' && (
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
