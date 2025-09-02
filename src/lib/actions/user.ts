
'use server';

import { auth } from '@/lib/firebase/config';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getAdminDb } from '@/lib/firebase/admin';
import { updateProfile as updateClientProfile } from 'firebase/auth';
import { revalidatePath } from 'next/cache';

// Initialize admin SDK if not already done
getAdminDb();

export async function updateUserProfile(formData: FormData) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;
    let photoURL: string | null = null;

    try {
        if (photoFile) {
            // 1. Upload new photo to Firebase Storage
            const storage = getStorage().bucket('gs://agrisence-1dc30.appspot.com');
            const filePath = `profile-pictures/${user.uid}/${Date.now()}-${photoFile.name}`;
            const fileBuffer = Buffer.from(await photoFile.arrayBuffer());

            const file = storage.file(filePath);
            await file.save(fileBuffer, {
                metadata: { contentType: photoFile.type },
            });
            await file.makePublic();
            photoURL = file.publicUrl();
        }

        // 2. Update user profile using Admin SDK
        const updatePayload: { displayName?: string; photoURL?: string } = {};
        if (displayName !== user.displayName) {
            updatePayload.displayName = displayName;
        }
        if (photoURL) {
            updatePayload.photoURL = photoURL;
        }

        if (Object.keys(updatePayload).length > 0) {
            await getAuth().updateUser(user.uid, updatePayload);
        }
        
        revalidatePath('/profile');
        revalidatePath('/(app)', 'layout');

        return { success: true, photoURL: photoURL || user.photoURL };

    } catch (error: any) {
        console.error("Error updating profile: ", error);
        return { success: false, error: error.message || 'Failed to update profile.' };
    }
}
