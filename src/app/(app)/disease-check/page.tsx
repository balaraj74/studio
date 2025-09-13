
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, RefreshCw, Stethoscope, LocateFixed, BadgePercent, ShieldCheck, ListOrdered, TestTube2, Sprout, Leaf, Languages, Volume2, Video, Square, Loader2, Upload, X, VolumeX, History, CalendarDays, TrendingUp } from "lucide-react";
import {
  diagnoseCropDisease,
  type DiagnoseCropDiseaseOutput,
} from "@/ai/flows/crop-disease-detection";
import { translateText } from "@/ai/flows/translate-text-flow";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getDiagnosisHistory, type DiagnosisRecord } from "@/lib/actions/diagnoses";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const supportedLanguages = [
    { value: 'English', label: 'English', langCode: 'en-US' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', langCode: 'kn-IN' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)', langCode: 'hi-IN' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)', langCode: 'ta-IN' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)', langCode: 'te-IN' },
];

const ANALYSIS_INTERVAL = 3000; // 3 seconds
type SpeakingSection = 'remedy' | 'alternative' | 'prevention' | null;
type TranslatableSections = 'plantName' | 'diseaseName' | 'suggestedRemedy' | 'alternativeRemedies' | 'preventiveMeasures';


export default function DiseaseCheckPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [finalResult, setFinalResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [liveResult, setLiveResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingSection, setSpeakingSection] = useState<SpeakingSection>(null);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // States for translation
  const [translatedContent, setTranslatedContent] = useState<Partial<DiagnoseCropDiseaseOutput['diseaseDiagnosis'] & DiagnoseCropDiseaseOutput['plantIdentification']>>({});
  const [isTranslating, setIsTranslating] = useState<Partial<Record<TranslatableSections, boolean>>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const originalResultRef = useRef<DiagnoseCropDiseaseOutput | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Effect to manage speech synthesis state
  useEffect(() => {
    const handleSpeechEnd = () => setSpeakingSection(null);
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
    const loadVoices = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setVoices(window.speechSynthesis.getVoices());
        }
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    return () => {
      stopAnalysisLoop();
      stopCameraStream();
      previewUrls.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const setAndStoreFinalResult = (result: DiagnoseCropDiseaseOutput | null) => {
    setFinalResult(result);
    originalResultRef.current = result; // Store the original English version
    setTranslatedContent({}); // Reset translations when a new result comes in
    setSelectedLanguage('English'); // Reset language to default
  }

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    if (lang === 'English' || !originalResultRef.current) {
        setTranslatedContent({});
        return;
    }

    const sectionsToTranslate: { key: TranslatableSections; text: string }[] = [
        { key: 'plantName', text: originalResultRef.current.plantIdentification.plantName },
        { key: 'diseaseName', text: originalResultRef.current.diseaseDiagnosis.diseaseName },
        { key: 'suggestedRemedy', text: originalResultRef.current.diseaseDiagnosis.suggestedRemedy },
        { key: 'alternativeRemedies', text: originalResultRef.current.diseaseDiagnosis.alternativeRemedies },
        { key: 'preventiveMeasures', text: originalResultRef.current.diseaseDiagnosis.preventiveMeasures },
    ];

    for (const { key, text } of sectionsToTranslate) {
        setIsTranslating(prev => ({ ...prev, [key]: true }));
        try {
            const { translatedText } = await translateText({ text, targetLanguage: lang });
            setTranslatedContent(prev => ({ ...prev, [key]: translatedText }));
        } catch (err) {
            console.error(`Failed to translate ${key}:`, err);
            toast({ variant: 'destructive', title: 'Translation Error', description: `Could not translate ${key}.` });
            // Revert to original text on error
            setTranslatedContent(prev => ({ ...prev, [key]: text }));
        } finally {
            setIsTranslating(prev => ({ ...prev, [key]: false }));
        }
    }
};

  const stopCameraStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
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
  
  const handleGetLocation = () => {
      if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
              toast({ title: "Location Acquired" });
          },
          () => {
              setError("Permission to access location was denied. Please enable it in your browser settings.");
          }
      );
  }

  const runDiagnosis = async (imageUris: string[]) => {
      if (!user) {
          setError("You must be logged in to perform a diagnosis.");
          return null;
      }
       if (!location) {
          setError("Location must be set to perform a diagnosis.");
          return null;
       }
       try {
           const diagnosisResult = await diagnoseCropDisease({ 
                imageUris: imageUris,
                geolocation: location,
                userId: user.uid, // Pass userId for history saving
            });
            return diagnosisResult;
       } catch(e) {
           console.error(e);
           const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
           setError(`Diagnosis failed. ${errorMessage}`);
           return null;
       }
  }


  const startAnalysisLoop = useCallback(() => {
    if (!location || !user) {
      toast({ variant: "destructive", title: "Setup Required", description: "Please log in and set your location before starting the diagnosis." });
      setIsStreaming(false);
      return;
    }

    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    analysisIntervalRef.current = setInterval(async () => {
      if (isAnalyzing) return; 

      const frameUri = frameToDataUri();
      if (!frameUri) return;

      setIsAnalyzing(true);
      const diagnosisResult = await runDiagnosis([frameUri]);
      if (diagnosisResult) {
           if (diagnosisResult.plantIdentification.isPlant) {
              setLiveResult(diagnosisResult);
              setError(null);
          } else {
              setError(diagnosisResult.plantIdentification.plantName || "No plant detected in the current view.");
              setLiveResult(null);
          }
      }
      setIsAnalyzing(false);
    }, ANALYSIS_INTERVAL);
  }, [isAnalyzing, location, toast, user]);


  const stopAnalysisLoop = () => {
      if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
      }
  };


  const handleStartStreaming = async () => {
    setError(null);
    setAndStoreFinalResult(null);
    setLiveResult(null);

    if (!location) {
        toast({ variant: "destructive", title: "Location Needed", description: "Please get your location before starting the scan."});
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }});
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
            startAnalysisLoop();
        }
    } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
    }
  };
  
  const handleStopStreaming = () => {
      stopAnalysisLoop();
      stopCameraStream();
      setIsStreaming(false);
      setIsAnalyzing(false);
      if (liveResult) {
          setAndStoreFinalResult(liveResult);
      }
  };

  const handleReset = () => {
    handleStopStreaming();
    setLocation(null);
    setAndStoreFinalResult(null);
    setLiveResult(null);
    setError(null);
    setImageFiles([]);
    previewUrls.forEach(URL.revokeObjectURL);
    setPreviewUrls([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const allFiles = [...imageFiles, ...newFiles].slice(0, 5); // Limit to 5 images
      setImageFiles(allFiles);
      
      previewUrls.forEach(URL.revokeObjectURL); // Clean up old urls
      const newUrls = allFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newUrls);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    previewUrls.forEach(URL.revokeObjectURL);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadDiagnosis = async () => {
    if (imageFiles.length === 0 || !location) {
        toast({ variant: 'destructive', title: "Missing Information", description: "Please upload at least one image and set your location."});
        return;
    }
    
    setIsUploading(true);
    setAndStoreFinalResult(null);
    setError(null);

    try {
        const imageUris = await Promise.all(imageFiles.map(fileToDataUri));
        const diagnosisResult = await runDiagnosis(imageUris);
        if(diagnosisResult) {
             if (!diagnosisResult.plantIdentification.isPlant) {
                setError(diagnosisResult.plantIdentification.plantName || "Could not identify a plant. The image may be unclear.");
                setAndStoreFinalResult(null);
            } else {
                setAndStoreFinalResult(diagnosisResult);
            }
        }
    } finally {
        setIsUploading(false);
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    return text.replace(/(\*|_|#|`|~)/g, '');
  };

  const handleSpeak = (text: string, section: SpeakingSection) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      if (speakingSection === section && synth.speaking) {
        synth.cancel();
        setSpeakingSection(null);
        return;
      }

      if (synth.speaking) {
        synth.cancel();
      }
      
      const cleanedText = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const langInfo = supportedLanguages.find(l => l.value === selectedLanguage);
      if (langInfo) {
        utterance.lang = langInfo.langCode;
        const voice = voices.find(v => v.lang === langInfo.langCode);
        if (voice) utterance.voice = voice;
      }
      utterance.onstart = () => setSpeakingSection(section);
      
      synth.speak(utterance);
    } else {
      toast({ variant: "destructive", title: "TTS Not Supported" });
    }
  };


  const ResultSection = ({ title, content, icon: Icon, sectionId, isTranslating }: { title: string, content: string, icon: React.ElementType, sectionId: SpeakingSection, isTranslating?: boolean }) => (
    <div>
        <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</Label>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSpeak(content, sectionId)} disabled={isTranslating}>
                {speakingSection === sectionId ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="sr-only">Read aloud</span>
            </Button>
        </div>
        {isTranslating ? <Skeleton className="h-20 w-full mt-1" /> : <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{content}</p>}
    </div>
  );
  
  const LiveResultDisplay = ({ result }: { result: DiagnoseCropDiseaseOutput | null }) => {
    if (!result) {
      return (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Searching for plants...</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <Sprout className="h-6 w-6 text-primary" />
            <p className="text-xl font-bold">{result.plantIdentification.plantName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <p className="text-xl font-bold">{result.diseaseDiagnosis.diseaseName}</p>
          </div>
          <div>
              <Label className="flex items-center gap-2 text-muted-foreground"><BadgePercent className="h-4 w-4" /> Diagnosis Confidence</Label>
              <div className="flex items-center gap-2 pt-1">
                <Progress value={result.diseaseDiagnosis.confidenceScore * 100} className="w-2/3" />
                <span className="font-semibold text-sm">{(result.diseaseDiagnosis.confidenceScore * 100).toFixed(0)}%</span>
              </div>
          </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg"><Stethoscope className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Advanced Crop Diagnosis</h1>
          <p className="text-muted-foreground">Use live scan or upload images for AI analysis.</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>1. Setup</CardTitle>
            <CardDescription>Configure your location before starting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Button variant="outline" className="w-full" onClick={handleGetLocation} disabled={isStreaming || !!location || isUploading}>
                    <LocateFixed className="mr-2 h-4 w-4" />
                    {location ? `Location Acquired` : "Get Current Location"}
                </Button>
              </div>

            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleReset} disabled={isStreaming || isUploading} className="w-full"><RefreshCw className="mr-2 h-4 w-4" /> Reset All</Button>
            </CardFooter>
        </Card>

        <canvas ref={canvasRef} className="hidden"></canvas>
        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />

        <div className="lg:col-span-3">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="live">Live Diagnosis</TabsTrigger>
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="live">
              <Card>
                <CardHeader>
                    <CardTitle>Live Camera Scan</CardTitle>
                    <CardDescription>Point your camera towards a plant leaf for real-time analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg border aspect-video object-cover bg-muted"></video>
                    <div className="p-4 rounded-lg border bg-card min-h-[160px] flex items-center justify-center">
                        {!isStreaming ? (
                            <p className="text-muted-foreground text-center">Click "Start Live Diagnosis" to begin.</p>
                        ) : error ? (
                             <p className="text-destructive text-center">{error}</p>
                        ) : (
                           <LiveResultDisplay result={liveResult} />
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                  {isStreaming ? (
                     <Button onClick={handleStopStreaming} variant="destructive" className="w-full"><Square className="mr-2 h-4 w-4" /> Stop Diagnosis</Button>
                  ) : (
                     <Button onClick={handleStartStreaming} disabled={!location || isUploading} className="w-full"><Video className="mr-2 h-4 w-4" /> Start Live Diagnosis</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
               <Card>
                 <CardHeader>
                    <CardTitle>Upload from Device</CardTitle>
                    <CardDescription>Select up to 5 images for diagnosis.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Upload className="mr-2 h-4 w-4"/> Select Images
                    </Button>
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md"/>
                                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                     {error && (
                        <Alert variant="destructive">
                          <AlertTitle>Analysis Failed</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                 </CardContent>
                 <CardFooter>
                    <Button className="w-full" onClick={handleUploadDiagnosis} disabled={isUploading || imageFiles.length === 0 || !location}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        {isUploading ? "Analyzing..." : `Diagnose ${imageFiles.length} Image(s)`}
                    </Button>
                 </CardFooter>
               </Card>
            </TabsContent>
            <TabsContent value="history">
                <DiagnosisHistoryTab />
            </TabsContent>
          </Tabs>

            {finalResult && finalResult.plantIdentification.isPlant && (
            <Card className="animate-in fade-in-50 mt-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-lg"><Sprout className="text-primary" /></div>
                              <span>{isTranslating.plantName ? <Skeleton className="h-6 w-32" /> : translatedContent.plantName || finalResult.plantIdentification.plantName}</span>
                            </CardTitle>
                            <CardDescription>Disease Diagnosis: {isTranslating.diseaseName ? <Skeleton className="h-5 w-24 mt-1" /> : translatedContent.diseaseName || finalResult.diseaseDiagnosis.diseaseName}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={Object.values(isTranslating).some(v => v)}>
                                <SelectTrigger className="w-auto sm:w-[150px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map(lang => (<SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center gap-2 text-muted-foreground"><BadgePercent className="h-4 w-4" /> Diagnosis Confidence</Label>
                          <div className="flex items-center gap-2 pt-1">
                            <Progress value={finalResult.diseaseDiagnosis.confidenceScore * 100} className="w-2/3" />
                            <span className="font-semibold text-sm">{(finalResult.diseaseDiagnosis.confidenceScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground"><TestTube2 className="h-4 w-4" /> Severity</Label>
                            <p className="font-semibold">{finalResult.diseaseDiagnosis.severity}</p>
                        </div>
                    </div>
                    {finalResult.riskPrediction && (
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5"/> Future Risk Prediction</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><strong>Next Risk:</strong> {finalResult.riskPrediction.nextRisk} {`(${finalResult.riskPrediction.timeline})`}</p>
                                <p className="text-muted-foreground">{finalResult.riskPrediction.reasoning}</p>
                            </CardContent>
                        </Card>
                    )}
                    <ResultSection title="Suggested Remedy" content={translatedContent.suggestedRemedy || finalResult.diseaseDiagnosis.suggestedRemedy} icon={ListOrdered} sectionId="remedy" isTranslating={isTranslating.suggestedRemedy} />
                    <ResultSection title="Alternative Home Remedies" content={translatedContent.alternativeRemedies || finalResult.diseaseDiagnosis.alternativeRemedies} icon={Leaf} sectionId="alternative" isTranslating={isTranslating.alternativeRemedies} />
                    <ResultSection title="Preventive Measures" content={translatedContent.preventiveMeasures || finalResult.diseaseDiagnosis.preventiveMeasures} icon={ShieldCheck} sectionId="prevention" isTranslating={isTranslating.preventiveMeasures} />
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}


function DiagnosisHistoryTab() {
    const { user } = useAuth();
    const [history, setHistory] = useState<DiagnosisRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                setIsLoading(true);
                const records = await getDiagnosisHistory(user.uid);
                setHistory(records);
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({length: 3}).map((_, i) => (
                     <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Diagnosis History</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Perform a diagnosis to see your history here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {history.map(record => (
                <Card key={record.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Image
                            src={record.imageUrl}
                            alt="Diagnosed plant"
                            width={80}
                            height={80}
                            className="rounded-md object-cover aspect-square"
                        />
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{record.plantName}</p>
                            <p className="text-sm font-medium text-destructive">{record.diseaseName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <CalendarDays className="h-3 w-3" />
                                {format(record.timestamp, 'd MMM, yyyy, h:mm a')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

}
