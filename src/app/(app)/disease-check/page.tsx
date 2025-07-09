"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, Leaf, AlertCircle, Wand2, RefreshCw } from "lucide-react";
import Image from "next/image";
import {
  diagnoseCropDisease,
  type DiagnoseCropDiseaseOutput,
} from "@/ai/flows/crop-disease-detection";
import { useToast } from "@/hooks/use-toast";

export default function DiseaseCheckPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("File size exceeds 4MB. Please choose a smaller image.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const photoDataUri = await fileToDataUri(selectedFile);
      const diagnosisResult = await diagnoseCropDisease({ photoDataUri });
      setResult(diagnosisResult);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get diagnosis. ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Diagnosis Failed",
        description: "There was a problem contacting the AI service. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Crop Disease Check</h1>
        <p className="text-muted-foreground">
          Upload an image of a crop leaf to identify potential diseases and get
          treatment suggestions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Leaf Image</CardTitle>
          <CardDescription>
            For best results, use a clear image of a single leaf against a plain background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex items-center justify-center w-full"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                if(fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
                handleFileChange({ target: { files: e.dataTransfer.files } } as any);
              }
            }}
          >
            <Label
              htmlFor="picture"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={previewUrl}
                    alt="Selected leaf preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or WEBP (MAX. 4MB)
                  </p>
                </div>
              )}
              <Input
                id="picture"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleDiagnose} disabled={!selectedFile || isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Diagnosing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Diagnose
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="mr-2 text-primary" />
              Diagnosis Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Identified Disease</Label>
              <p className="text-lg font-semibold">{result.diseaseName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Suggested Remedy</Label>
              <p className="text-base whitespace-pre-wrap">{result.suggestedRemedy}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
