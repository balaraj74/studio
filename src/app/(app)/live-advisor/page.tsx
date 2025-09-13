
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { liveFarmAdvisor, type LiveFarmAdvisorOutput } from "@/ai/flows/live-advisor-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Languages, Mic, Bot, User, Volume2, Loader2, AlertTriangle, Video, Square, Camera, VolumeX, Eye, Info, CircleDashed } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function LiveAdvisorPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [lastResponse, setLastResponse] = useState<LiveFarmAdvisorOutput | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => { // Cleanup on unmount
        stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleSpeechEnd = () => setIsSpeaking(false);
    const synth = window.speechSynthesis;
    if (synth) {
      synth.addEventListener('end', handleSpeechEnd);
      synth.addEventListener('error', handleSpeechEnd);
    }
    return () => {
      if (synth) {
        synth.cancel();
        synth.removeEventListener('end', handleSpeechEnd);
        synth.removeEventListener('error', handleSpeechEnd);
      }
    };
  }, []);

  const setupRecognition = useCallback(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            processTranscript(finalTranscript.trim());
        }
        if(speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
           if (recognitionRef.current && recognitionRef.current.listening) {
             recognition.stop();
           }
        }, 1500);
      };
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setLastResponse(null);
        setLastTranscript(null);
      };
      recognition.onend = () => {
        setIsListening(false);
        if (isSessionActive && !isLoading) {
          setTimeout(() => {
            try { recognition.start(); } catch(e) { /* ignore */ }
          }, 100);
        }
      };
      recognition.onerror = (event: any) => {
        setError(event.error === 'no-speech' ? 'No speech detected.' : 'Voice recognition error.');
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    } else {
      setError("Voice recognition not supported by your browser.");
    }
  }, [isSessionActive, isLoading]);


  useEffect(() => {
    setupRecognition();
  }, [setupRecognition]);


  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis && setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    loadVoices();
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const getPermissionsAndStartStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      setHasPermissions(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setHasPermissions(false);
      toast({
        variant: 'destructive',
        title: 'Permissions Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
      return false;
    }
  };

  const startSession = async () => {
    setError(null);
    setLastResponse(null);
    setLastTranscript(null);
    const permissionGranted = await getPermissionsAndStartStream();
    if (permissionGranted) {
      setIsSessionActive(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) { console.error("Recognition start failed", e)}
      }
    }
  };

  const stopSession = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if(speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    window.speechSynthesis?.cancel();
    setIsSessionActive(false);
    setIsListening(false);
    setIsLoading(false);
  };

  const frameToDataUri = (): string | null => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if(video.videoWidth === 0 || video.videoHeight === 0) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const processTranscript = async (text: string) => {
    if (!text.trim() || !isSessionActive) return;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const videoFrameUri = frameToDataUri();
    if (!videoFrameUri) {
        setError("Could not capture video frame.");
        return;
    }
    
    setLastTranscript(text);
    setIsLoading(true);
    setLastResponse(null);

    try {
      const langInfo = selectedLanguage === 'en-IN' ? 'English' : 'Kannada';
      const result = await liveFarmAdvisor({ videoFrameUri, farmerQuery: text, language: langInfo });
      setLastResponse(result);
      handleSpeak(result.responseToQuery, selectedLanguage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't get a response.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.lang === lang);
      if (voice) utterance.voice = voice;
      utterance.lang = lang;
      utterance.onstart = () => setIsSpeaking(true);
      synth.speak(utterance);
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'AI is thinking...';
    if (isListening) return 'Listening... speak now';
    return 'Ready for your question';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg"><Video className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Live Farm Advisor</h1>
          <p className="text-muted-foreground">Get real-time AI advice via video and voice.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
           <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted border" autoPlay muted playsInline />
           <canvas ref={canvasRef} className="hidden" />
           {(lastResponse || error || isSessionActive) && (
                <div className="w-full text-left space-y-4 p-4 border rounded-lg bg-muted/50 min-h-[100px] mt-4">
                     {error && (
                        <Alert variant="destructive" className="text-left">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {lastResponse && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold">Visual Analysis:</p>
                                    <p className="text-muted-foreground">{lastResponse.visualAnalysis}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold">AgriSence says:</p>
                                    <p className="text-muted-foreground">{lastResponse.responseToQuery}</p>
                                </div>
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSpeak(lastResponse.responseToQuery, selectedLanguage)}>
                                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </div>
                            {lastResponse.proactiveAlert !== 'None' && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Proactive Alert</AlertTitle>
                                    <AlertDescription>{lastResponse.proactiveAlert}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                     {isSessionActive && !lastResponse && !error && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            {lastTranscript ? (
                                <>
                                 <User className="h-5 w-5 mr-2" />
                                 <p className="italic">"{lastTranscript}"</p>
                                </>
                            ): (
                                <>
                                <CircleDashed className="h-5 w-5 mr-2 animate-spin" />
                                <p>Waiting for your question...</p>
                                </>
                            )}
                        </div>
                     )}
                </div>
            )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row items-center gap-4 bg-muted/50 p-4 rounded-b-2xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                <div className={cn("transition-colors", isListening ? "text-red-500" : "text-primary")}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Mic className="h-5 w-5"/>}
                </div>
                <span className="flex-1">{getStatusText()}</span>
                 <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
                    <SelectTrigger className="w-auto h-8 text-xs border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en-IN">English</SelectItem>
                        <SelectItem value="kn-IN">Kannada</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>

             {!isSessionActive ? (
                <Button className="w-full sm:w-auto" onClick={startSession}><Camera className="mr-2 h-4 w-4"/> Start Session</Button>
            ) : (
                <Button className="w-full sm:w-auto" variant="destructive" onClick={stopSession}><Square className="mr-2 h-4 w-4"/> End Session</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
