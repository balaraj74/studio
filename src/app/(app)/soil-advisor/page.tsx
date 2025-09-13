
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getSoilAdvice, GetSoilAdviceInputSchema, type GetSoilAdviceOutput } from '@/ai/flows/soil-advisor-flow';
import { parseSoilReport, type ParseSoilReportOutput } from '@/ai/flows/soil-report-parser-flow';
import { Loader2, Bot, TestTube, Leaf, Sprout, CheckCircle, AlertTriangle, XCircle, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import { Progress } from '@/components/ui/progress';


const statusStyles = {
    "Very Low": "bg-red-700/20 text-red-400",
    "Low": "bg-yellow-600/20 text-yellow-400",
    "Slightly Acidic": "bg-yellow-600/20 text-yellow-400",
    "Sufficient": "bg-green-600/20 text-green-400",
    "Optimal": "bg-green-600/20 text-green-400",
    "High": "bg-orange-600/20 text-orange-400",
    "Slightly Alkaline": "bg-orange-600/20 text-orange-400",
    "Very High": "bg-red-700/20 text-red-400",
};

const statusIcons = {
    "Very Low": <XCircle className="h-5 w-5 text-red-400" />,
    "Low": <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    "Slightly Acidic": <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    "Sufficient": <CheckCircle className="h-5 w-5 text-green-400" />,
    "Optimal": <CheckCircle className="h-5 w-5 text-green-400" />,
    "High": <AlertTriangle className="h-5 w-5 text-orange-400" />,
    "Slightly Alkaline": <AlertTriangle className="h-5 w-5 text-orange-400" />,
    "Very High": <XCircle className="h-5 w-5 text-red-400" />,
};

const ResultCard = ({ result }: { result: GetSoilAdviceOutput }) => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Nutrient Analysis</CardTitle>
                <CardDescription>Status of key soil nutrients.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.nutrientAnalysis.map(nutrient => (
                    <div key={nutrient.nutrient} className={cn("p-4 rounded-lg text-center", statusStyles[nutrient.status as keyof typeof statusStyles])}>
                        <div className="flex items-center justify-center gap-2">
                           {statusIcons[nutrient.status as keyof typeof statusIcons]}
                           <p className="font-bold text-lg">{nutrient.nutrient}</p>
                        </div>
                        <p className="text-sm font-semibold">{nutrient.status}</p>
                        <p className="text-xs">{nutrient.comment}</p>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5 text-primary"/> Chemical Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fertilizer</TableHead>
                            <TableHead>Dosage (per acre)</TableHead>
                            <TableHead>Application Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.chemicalRecommendations.map((rec, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{rec.fertilizerName}</TableCell>
                                <TableCell>{rec.dosage}</TableCell>
                                <TableCell>{rec.applicationTime}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary"/> Organic Alternatives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {result.organicAlternatives.map((alt, i) => (
                    <div key={i}>
                        <h4 className="font-semibold">{alt.name} <span className="text-sm text-muted-foreground font-normal">- {alt.applicationRate}</span></h4>
                        <p className="text-sm text-muted-foreground">{alt.benefits}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
        
        <Alert>
            <Sprout className="h-4 w-4" />
            <AlertTitle>Soil Management Tips</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                    {result.soilManagementTips.split('*').filter(tip => tip.trim()).map((tip, i) => <li key={i}>{tip.trim()}</li>)}
                </ul>
            </AlertDescription>
        </Alert>
    </div>
);

function UploadTab() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [cropName, setCropName] = useState('');
    const [language, setLanguage] = useState('English');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParseSoilReportOutput | null>(null);
    const [adviceResult, setAdviceResult] = useState<GetSoilAdviceOutput | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyzeReport = async () => {
        if (!file || !cropName || !user) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a file, enter a crop name, and ensure you are logged in.' });
            return;
        }
        setIsLoading(true);
        setParsedData(null);
        setAdviceResult(null);
        setUploadProgress(0);

        try {
            // 1. Upload file to Firebase Storage
            const storageRef = ref(storage, `soil_reports/${user.uid}/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            });

            await uploadTask;
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // 2. Parse the report using AI
            const parsedResult = await parseSoilReport({ reportDataUri: fileUrl });
            setParsedData(parsedResult);
            toast({ title: 'Report Parsed Successfully', description: 'Now generating fertilizer advice...' });
            
             // Create a record in Firestore
            await addDoc(collection(db, `users/${user.uid}/soil_reports`), {
                fileName: file.name,
                fileUrl,
                cropName,
                parsedData: parsedResult,
                createdAt: new Date(),
            });

            // 3. Get advice using parsed data
            const advice = await getSoilAdvice({
                cropName,
                soilPh: parsedResult.soilPh,
                nitrogen: parsedResult.nitrogen,
                phosphorus: parsedResult.phosphorus,
                potassium: parsedResult.potassium,
                language,
            });
            setAdviceResult(advice);

        } catch (error) {
            console.error('Analysis failed:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: 'Analysis Failed', description: errorMessage });
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Soil Test Report</CardTitle>
                <CardDescription>Upload a PDF or image of your soil report for automated analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="crop-name-upload">Planned Crop</Label>
                    <Input id="crop-name-upload" placeholder="e.g., 'Maize'" value={cropName} onChange={e => setCropName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Soil Report File</Label>
                    <Input id="file-upload" type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isLoading} />
                </div>
                 <div className="space-y-2">
                    <Label>Response Language</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Kannada">Kannada</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {isLoading && uploadProgress > 0 && <Progress value={uploadProgress} />}
            </CardContent>
            <CardFooter>
                <Button onClick={handleAnalyzeReport} disabled={isLoading || !file || !cropName}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    {isLoading ? (parsedData ? 'Getting Advice...' : 'Parsing Report...') : 'Analyze Report'}
                </Button>
            </CardFooter>
            {adviceResult && (
                 <div className="p-6 pt-0 animate-in fade-in-50">
                    <ResultCard result={adviceResult} />
                </div>
            )}
        </Card>
    );
}


export default function SoilAdvisorPage() {
  const [result, setResult] = useState<GetSoilAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof GetSoilAdviceInputSchema>>({
    resolver: zodResolver(GetSoilAdviceInputSchema),
    defaultValues: {
      cropName: '',
      soilPh: 7.0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      language: 'English',
    },
  });

  const onSubmit = async (data: z.infer<typeof GetSoilAdviceInputSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await getSoilAdvice(data);
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI could not generate a report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <TestTube className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Soil Advisor</h1>
          <p className="text-muted-foreground">Get fertilizer and soil health recommendations.</p>
        </div>
      </div>

        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Enter Data Manually</TabsTrigger>
                <TabsTrigger value="upload">Upload Report</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
                <Card>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                        <CardTitle>Enter Your Soil Data</CardTitle>
                        <CardDescription>
                            Provide your soil test results and planned crop to get advice.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="cropName" render={({ field }) => ( <FormItem> <FormLabel>Planned Crop</FormLabel> <FormControl><Input placeholder="e.g., 'Paddy'" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="soilPh" render={({ field }) => ( <FormItem> <FormLabel>Soil pH</FormLabel> <FormControl><Input type="number" step="0.1" placeholder="e.g., 6.8" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="nitrogen" render={({ field }) => ( <FormItem> <FormLabel>Nitrogen (N) in kg/ha</FormLabel> <FormControl><Input type="number" placeholder="e.g., 40" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="phosphorus" render={({ field }) => ( <FormItem> <FormLabel>Phosphorus (P) in kg/ha</FormLabel> <FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="potassium" render={({ field }) => ( <FormItem> <FormLabel>Potassium (K) in kg/ha</FormLabel> <FormControl><Input type="number" placeholder="e.g., 35" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="language" render={({ field }) => ( <FormItem> <FormLabel>Response Language</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="English">English</SelectItem> <SelectItem value="Kannada">Kannada</SelectItem> <SelectItem value="Hindi">Hindi</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            </div>
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Analyzing...' : 'Get AI Advice'}
                        </Button>
                        </CardFooter>
                    </form>
                    </Form>
                     {isLoading && (
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                        </CardContent>
                    )}
                    {result && !isLoading && (
                        <CardContent className="animate-in fade-in-50">
                            <ResultCard result={result} />
                        </CardContent>
                    )}
                </Card>
            </TabsContent>
            <TabsContent value="upload">
                <UploadTab />
            </TabsContent>
        </Tabs>
    </div>
  );
}
