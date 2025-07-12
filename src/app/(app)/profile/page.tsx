
'use client';

import { UserNav } from "@/components/user-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut, Shield, HelpCircle, Settings, User as UserIcon } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";


const menuItems = [
    { label: "Account Settings", icon: Settings },
    { label: "Privacy Policy", icon: Shield },
    { label: "Help & Support", icon: HelpCircle },
]

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
        await signOut(auth);
        router.push('/');
        } catch (error) {
        console.error("Error signing out: ", error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-primary">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback className="text-4xl">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{user.displayName || "AgriSence User"}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

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
                    </ul>
                </CardContent>
            </Card>

             <Card>
                <CardContent className="p-2">
                     <button onClick={handleSignOut} className="w-full flex items-center p-3 hover:bg-muted rounded-lg text-red-600">
                        <div className="flex items-center gap-4">
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </div>
                    </button>
                </CardContent>
             </Card>
        </div>
    )
}
