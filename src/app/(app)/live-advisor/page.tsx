
"use client";

import { useState, useRef, useEffect } from "react";
import { liveFarmAdvisor, type LiveFarmAdvisorOutput } from "@/ai/flows/live-advisor-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Languages, Mic, Bot, User, Volume2, Loader2, AlertTriangle, Video, Square, Camera, VolumeX, Eye, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function LiveAdvisorPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
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

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => processTranscript(event.results[0][0].transcript);
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        setError(event.error === 'no-speech' ? 'No speech detected.' : 'Voice recognition error.');
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    } else {
      setError("Voice recognition not supported by your browser.");
    }
  }, []);

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

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
      return false;
    }
  };

  const startSession = async () => {
    setError(null);
    setLastResponse(null);
    setLastTranscript(null);
    const permissionGranted = await getCameraPermission();
    if (permissionGranted) {
      setIsSessionActive(true);
    }
  };

  const stopSession = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsSessionActive(false);
    setIsListening(false);
    setIsLoading(false);
  };

  const handleMicClick = () => {
    if (!recognitionRef.current || isListening || isLoading) return;
    setError(null);
    setLastResponse(null);
    setLastTranscript(null);
    recognitionRef.current.start();
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
        <CardHeader>
          <CardTitle>Live Session</CardTitle>
          <CardDescription>
            {isSessionActive ? "Your live session is active." : "Start a session to get live advice."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted border" autoPlay muted />
            <canvas ref={canvasRef} className="hidden" />
            {!(hasCameraPermission && isSessionActive) && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
            {!isSessionActive ? (
                <Button className="w-full" onClick={startSession}><Camera className="mr-2 h-4 w-4"/> Start Live Session</Button>
            ) : (
                <Button className="w-full" variant="destructive" onClick={stopSession}><Square className="mr-2 h-4 w-4"/> End Session</Button>
            )}
        </CardFooter>
      </Card>

      {isSessionActive && (
        <Card>
            <CardHeader>
                <CardTitle>AI Interaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                 <div className="flex justify-center items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en-IN">English (India)</SelectItem>
                        <SelectItem value="kn-IN">Kannada</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <Button
                    size="lg"
                    className="h-20 w-20 rounded-full"
                    onClick={handleMicClick}
                    disabled={isLoading || isListening}
                >
                    {isListening || isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
                </Button>
                <p className="text-sm text-muted-foreground">{isListening ? 'Listening...' : isLoading ? 'AI is thinking...' : 'Tap mic to ask a question'}</p>
                 {error && (
                    <Alert variant="destructive" className="text-left">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            {(lastTranscript || lastResponse) && (
                 <CardFooter>
                    <div className="w-full text-left space-y-4 p-4 border rounded-lg bg-muted/50">
                        {lastTranscript && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold">You asked:</p>
                                    <p className="text-muted-foreground">{lastTranscript}</p>
                                </div>
                            </div>
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
                    </div>
                </CardFooter>
            )}
        </Card>
      )}
    </div>
  );
}
