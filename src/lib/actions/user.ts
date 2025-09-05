
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getAdminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

// Initialize admin SDK if not already done
getAdminDb();

export async function updateUserProfile(formData: FormData) {
    const userId = formData.get('userId') as string;
    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }

    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;
    let photoURL: string | null = null;

    try {
        if (photoFile && photoFile.size > 0) {
            // 1. Upload new photo to Firebase Storage
            const storage = getStorage().bucket('gs://agrisence-1dc30.firebasestorage.app');
            const filePath = `profile-pictures/${userId}/${Date.now()}-${photoFile.name}`;
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
        const currentUser = await getAuth().getUser(userId);

        // Only add to payload if the value has changed
        if (displayName && displayName !== currentUser.displayName) {
            updatePayload.displayName = displayName;
        }
        if (photoURL) {
            updatePayload.photoURL = photoURL;
        }

        if (Object.keys(updatePayload).length > 0) {
            await getAuth().updateUser(userId, updatePayload);
        }
        
        revalidatePath('/profile');
        revalidatePath('/(app)', 'layout'); // Revalidate layout to update UserNav

        return { success: true, photoURL: photoURL || currentUser.photoURL };

    } catch (error: any) {
        console.error("Error updating profile: ", error);
        return { success: false, error: error.message || 'Failed to update profile.' };
    }
}
