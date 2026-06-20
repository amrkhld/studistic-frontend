'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
    apiUpdateProfile,
    apiUpdateMyFeatures,
    apiPredict,
    ProfileUpdate,
    StudentFeaturesPayload,
    PredictionResult,
} from '@/lib/api';

/**
 * Hook for profile management — updating user info, student features,
 * and triggering predictions after feature changes.
 */
export function useProfile() {
    const { token, updateUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    /**
     * Update user profile (name, department, year).
     * Also updates the AuthContext so sidebar reflects changes immediately.
     */
    const updateUserProfile = useCallback(async (data: ProfileUpdate) => {
        if (!token) throw new Error('Not authenticated');
        setError(null);

        try {
            const result = await apiUpdateProfile(data, token);
            // Update the AuthContext so sidebar/global state reflects changes
            updateUser({
                full_name: result.full_name,
                department: result.department,
                year: result.year,
                avatar_url: result.avatar_url,
            });
            return result;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update profile';
            setError(msg);
            throw err;
        }
    }, [token, updateUser]);

    /**
     * Update student features AND auto-trigger a new prediction.
     * Returns the new prediction result.
     */
    const updateFeaturesAndPredict = useCallback(async (
        features: StudentFeaturesPayload
    ): Promise<PredictionResult | null> => {
        if (!token) throw new Error('Not authenticated');
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // 1. Save features to DB
            await apiUpdateMyFeatures(features, token);

            // 2. Auto-trigger prediction with new features
            const prediction = await apiPredict(features, token);

            setSuccessMessage('Profile updated & prediction refreshed!');
            return prediction;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update features';
            setError(msg);
            return null;
        } finally {
            setIsUpdating(false);
        }
    }, [token]);

    /**
     * Full save: update both user profile and features, then predict.
     */
    const saveAll = useCallback(async (
        profileData: ProfileUpdate,
        features: StudentFeaturesPayload,
    ): Promise<PredictionResult | null> => {
        if (!token) throw new Error('Not authenticated');
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // 1. Update user profile
            const profileResult = await apiUpdateProfile(profileData, token);
            updateUser({
                full_name: profileResult.full_name,
                department: profileResult.department,
                year: profileResult.year,
                avatar_url: profileResult.avatar_url,
            });

            // 2. Save features
            await apiUpdateMyFeatures(features, token);

            // 3. Auto-predict
            const prediction = await apiPredict(features, token);

            setSuccessMessage('All changes saved & prediction refreshed!');
            return prediction;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to save changes';
            setError(msg);
            return null;
        } finally {
            setIsUpdating(false);
        }
    }, [token, updateUser]);

    /**
     * Upload an avatar image and update context immediately.
     */
    const uploadAvatar = useCallback(async (file: File) => {
        if (!token) throw new Error('Not authenticated');
        setIsUpdating(true);
        setError(null);
        
        try {
            const { apiUploadAvatar } = await import('@/lib/api');
            const result = await apiUploadAvatar(file, token);
            
            // Update AuthContext to immediately reflect the new avatar globally
            updateUser({ avatar_url: result.avatar_url });
            setSuccessMessage('Avatar updated successfully!');
            return result.avatar_url;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
            setError(msg);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    }, [token, updateUser]);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

    return {
        updateUserProfile,
        updateFeaturesAndPredict,
        saveAll,
        uploadAvatar,
        isUpdating,
        error,
        successMessage,
        clearMessages,
    };
}
