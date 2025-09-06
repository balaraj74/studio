
'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase/config';

export async function updateUserProfile(formData: FormData) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;
    let photoURL: string | undefined = undefined;

    try {
        if (photoFile && photoFile.size > 0) {
            const storageRef = ref(storage, `profile-pictures/${user.uid}/${photoFile.name}`);
            const snapshot = await uploadBytes(storageRef, photoFile);
            photoURL = await getDownloadURL(snapshot.ref);
        }

        const updatePayload: { displayName?: string; photoURL?: string } = {};
        
        if (displayName && displayName !== user.displayName) {
            updatePayload.displayName = displayName;
        }
        if (photoURL) {
            updatePayload.photoURL = photoURL;
        }

        if (Object.keys(updatePayload).length > 0) {
            await updateProfile(user, updatePayload);
        }

        return { success: true, photoURL: photoURL || user.photoURL };

    } catch (error: any) {
        console.error("Error updating profile: ", error);
        return { success: false, error: error.message || 'Failed to update profile.' };
    }
}
