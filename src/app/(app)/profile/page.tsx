
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon, ChevronRight, LogOut, Shield, HelpCircle, Settings, User as UserIcon, Camera, Save } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/actions/user";
import { getHarvests } from "@/lib/actions/harvests";
import { getExpenses } from "@/lib/actions/expenses";
import type { Harvest, Expense, ExpenseCategory } from "@/types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";


const menuItems = [
    { label: "Account Settings", icon: Settings },
    { label: "Privacy Policy", icon: Shield },
    { label: "Help & Support", icon: HelpCircle },
];

const COLORS = ["#74B72E", "#D6AD60", "#3b82f6", "#f97316", "#8b5cf6", "#14b8a6"];
const categoryColors: { [key in ExpenseCategory]: string } = {
  Seeds: "#16a34a",
  Fertilizer: "#ca8a04",
  Labor: "#2563eb",
  Equipment: "#ea580c",
  Other: "#9ca3af",
};


export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.photoURL || null);
    const [isSaving, setIsSaving] = useState(false);

    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPreviewUrl(user.photoURL || null);

            async function fetchData(currentUser: User) {
              setIsLoadingAnalytics(true);
              try {
                const [harvestData, expenseData] = await Promise.all([
                  getHarvests(currentUser.uid),
                  getExpenses(currentUser.uid),
                ]);
                setHarvests(harvestData);
                setExpenses(expenseData);
              } catch (error) {
                console.error("Failed to fetch analytics data:", error);
              } finally {
                setIsLoadingAnalytics(false);
              }
            }
            fetchData(user);
        }
    }, [user]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);

        const formData = new FormData();
        formData.append("displayName", displayName);
        if (photoFile) {
            formData.append("photo", photoFile);
        }

        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                toast({ title: "Profile updated successfully!" });
                // Optimistically update local state or let auth listener handle it
                if(result.photoURL) setPreviewUrl(result.photoURL);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSaving(false);
            setPhotoFile(null);
        }
    };
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const cropPerformanceData = useMemo(() => {
        const dataByCrop: { [key: string]: { yield: number } } = {};
        harvests.forEach((h) => {
          if (!dataByCrop[h.cropName]) {
            dataByCrop[h.cropName] = { yield: 0 };
          }
          let quantityInKg = h.quantity;
          if (h.unit === 'quintal') quantityInKg *= 100;
          if (h.unit === 'tonne') quantityInKg *= 1000;
          dataByCrop[h.cropName].yield += quantityInKg;
        });
        return Object.entries(dataByCrop).map(([name, { yield: totalYield }]) => ({ name, yield: totalYield }));
    }, [harvests]);

    const expenseBreakdownData = useMemo(() => {
        const dataByCategory: { [key: string]: number } = {};
        expenses.forEach((e) => {
          if (!dataByCategory[e.category]) {
            dataByCategory[e.category] = 0;
          }
          dataByCategory[e.category] += e.amount;
        });
        return Object.entries(dataByCategory).map(([name, value]) => ({ name, value: Math.round(value) }));
    }, [expenses]);


    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal information and view your stats.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                         <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                {previewUrl && <AvatarImage src={previewUrl} alt={displayName || 'User'} />}
                                <AvatarFallback className="text-4xl">
                                    {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
                                </AvatarFallback>
                            </Avatar>
                            <Label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-2 cursor-pointer hover:bg-secondary/80">
                                <Camera className="h-4 w-4" />
                                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </Label>
                        </div>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label>&nbsp;</Label> {/* Placeholder for alignment */}
                            <Button className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5"/> Your Analytics</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {isLoadingAnalytics ? (
                        <>
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </>
                    ) : (
                       <>
                         <div>
                            <h3 className="font-semibold mb-2 text-center">Crop Yield (kg)</h3>
                             <ResponsiveContainer width="100%" height={250}>
                                {cropPerformanceData.length > 0 ? (
                                    <BarChart data={cropPerformanceData}>
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : <p className="text-sm text-muted-foreground text-center pt-20">No harvest data yet.</p>}
                            </ResponsiveContainer>
                        </div>
                         <div>
                             <h3 className="font-semibold mb-2 text-center">Expense Breakdown</h3>
                             <ResponsiveContainer width="100%" height={250}>
                                {expenseBreakdownData.length > 0 ? (
                                    <PieChart>
                                        <Pie data={expenseBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {expenseBreakdownData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={categoryColors[entry.name as ExpenseCategory] || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                ) : <p className="text-sm text-muted-foreground text-center pt-20">No expense data yet.</p>}
                            </ResponsiveContainer>
                        </div>
                       </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-2">
                    <ul className="space-y-1">
                        {menuItems.map(item => (
                            <li key={item.label}>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                </button>
                            </li>
                        ))}
                         <li>
                            <button onClick={handleSignOut} className="w-full flex items-center p-3 hover:bg-muted rounded-lg text-red-600">
                                <div className="flex items-center gap-4">
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </div>
                            </button>
                         </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
