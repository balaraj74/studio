
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
import { Wand2, RefreshCw, Stethoscope, LocateFixed, BadgePercent, ShieldCheck, ListOrdered, TestTube2, Sprout, Leaf, Languages, Volume2, Video, Square, Loader2, Upload, X } from "lucide-react";
import {
  diagnoseCropDisease,
  type DiagnoseCropDiseaseOutput,
} from "@/ai/flows/crop-disease-detection";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Input } from "@/components/ui/input";

const supportedLanguages = [
    { value: 'English', label: 'English', langCode: 'en-US' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', langCode: 'kn-IN' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)', langCode: 'hi-IN' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)', langCode: 'ta-IN' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)', langCode: 'te-IN' },
];

const ANALYSIS_INTERVAL = 3000; // 3 seconds

export default function DiseaseCheckPage() {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [language, setLanguage] = useState<string>('English');
  const [finalResult, setFinalResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [liveResult, setLiveResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // States for file upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const startAnalysisLoop = useCallback(() => {
    if (!location) {
      toast({ variant: "destructive", title: "Location Required", description: "Please set your location before starting the diagnosis." });
      setIsStreaming(false);
      return;
    }

    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    analysisIntervalRef.current = setInterval(async () => {
      if (isAnalyzing) return; 

      const frameUri = frameToDataUri();
      if (!frameUri) return;

      setIsAnalyzing(true);
      try {
        const diagnosisResult = await diagnoseCropDisease({ 
            imageUris: [frameUri],
            geolocation: location,
            language: language
        });
        
        if (diagnosisResult.plantIdentification.isPlant) {
            setLiveResult(diagnosisResult);
            setError(null);
        } else {
            setError("No plant detected in the current view.");
            setLiveResult(null);
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Analysis failed. ${errorMessage}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, ANALYSIS_INTERVAL);
  }, [isAnalyzing, location, language, toast]);


  const stopAnalysisLoop = () => {
      if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
      }
  };


  const handleStartStreaming = async () => {
    setError(null);
    setFinalResult(null);
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
          setFinalResult(liveResult);
      }
  };

  const handleReset = () => {
    handleStopStreaming();
    setLocation(null);
    setFinalResult(null);
    setLiveResult(null);
    setError(null);
    setLanguage('English');
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
    setFinalResult(null);
    setError(null);

    try {
        const imageUris = await Promise.all(imageFiles.map(fileToDataUri));
        const diagnosisResult = await diagnoseCropDisease({ 
            imageUris: imageUris,
            geolocation: location,
            language: language
        });
        setFinalResult(diagnosisResult);
    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Diagnosis failed. ${errorMessage}`);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langInfo = supportedLanguages.find(l => l.value === language);
      if(langInfo) {
        utterance.lang = langInfo.langCode;
        const voice = voices.find(v => v.lang === langInfo.langCode);
        if (voice) utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ variant: "destructive", title: "TTS Not Supported" });
    }
  };

  const ResultSection = ({ title, content, icon: Icon }: { title: string, content: string, icon: React.ElementType }) => (
    <div>
        <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</Label>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSpeak(content)}>
                <Volume2 className="h-4 w-4" />
                <span className="sr-only">Read aloud</span>
            </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{content}</p>
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
            <CardDescription>Configure your location and language before starting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Response Language</Label>
                 <Select value={language} onValueChange={setLanguage} disabled={isStreaming || isUploading}>
                    <SelectTrigger id="language"><SelectValue placeholder="Select Language" /></SelectTrigger>
                    <SelectContent>
                        {supportedLanguages.map(lang => (<SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>))}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Button variant="outline" className="w-full" onClick={handleGetLocation} disabled={isStreaming || !!location || isUploading}>
                    <LocateFixed className="mr-2 h-4 w-4" />
                    {location ? `Location Acquired` : "Get Current Location"}
                </Button>
              </div>

            {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleReset} disabled={isStreaming || isUploading} className="w-full"><RefreshCw className="mr-2 h-4 w-4" /> Reset All</Button>
            </CardFooter>
        </Card>

        <canvas ref={canvasRef} className="hidden"></canvas>
        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />

        <div className="lg:col-span-3">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="live">Live Diagnosis</TabsTrigger>
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
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
                 </CardContent>
                 <CardFooter>
                    <Button className="w-full" onClick={handleUploadDiagnosis} disabled={isUploading || imageFiles.length === 0 || !location}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        {isUploading ? "Analyzing..." : `Diagnose ${imageFiles.length} Image(s)`}
                    </Button>
                 </CardFooter>
               </Card>
            </TabsContent>
          </Tabs>

            {finalResult && (
            <Card className="animate-in fade-in-50 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg"><Sprout className="text-primary" /></div>
                      <span>{finalResult.plantIdentification.plantName}</span>
                    </CardTitle>
                    <CardDescription>Disease Diagnosis: {finalResult.diseaseDiagnosis.diseaseName}</CardDescription>
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
                    <ResultSection title="Suggested Remedy" content={finalResult.diseaseDiagnosis.suggestedRemedy} icon={ListOrdered} />
                    <ResultSection title="Alternative Home Remedies" content={finalResult.diseaseDiagnosis.alternativeRemedies} icon={Leaf} />
                    <ResultSection title="Preventive Measures" content={finalResult.diseaseDiagnosis.preventiveMeasures} icon={ShieldCheck} />
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}
