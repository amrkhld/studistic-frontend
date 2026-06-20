'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
    apiPredict,
    apiGetMyFeatures,
    apiGetPredictionHistory,
    PredictionResult,
    StudentFeaturesPayload,
} from '@/lib/api';
import { studentFeatures as mockFeatures, latestPrediction as mockPrediction, featureImportances as mockImportances, generateRecommendations } from '@/lib/mock-data';

/** Default student features (used when user has no saved features) */
const DEFAULT_FEATURES: StudentFeaturesPayload = {
    hours_studied: mockFeatures.hours_studied,
    attendance: mockFeatures.attendance,
    sleep_hours: mockFeatures.sleep_hours,
    previous_scores: mockFeatures.previous_scores,
    tutoring_sessions: mockFeatures.tutoring_sessions,
    physical_activity: mockFeatures.physical_activity,
    parental_involvement: mockFeatures.parental_involvement,
    access_to_resources: mockFeatures.access_to_resources,
    extracurricular_activities: mockFeatures.extracurricular_activities,
    motivation_level: mockFeatures.motivation_level,
    internet_access: mockFeatures.internet_access,
    family_income: mockFeatures.family_income,
    teacher_quality: mockFeatures.teacher_quality,
    school_type: mockFeatures.school_type,
    peer_influence: mockFeatures.peer_influence,
    learning_disabilities: mockFeatures.learning_disabilities,
    parental_education_level: mockFeatures.parental_education_level,
    distance_from_home: mockFeatures.distance_from_home,
    gender: mockFeatures.gender,
};

function estimateScoreLocally(features: StudentFeaturesPayload): number {
    let score = 52.0; // Baseline
    score += (features.attendance / 100) * 26;
    score += (features.hours_studied / 44) * 16;
    score += ((features.sleep_hours - 4) / 8) * 6;
    score += (features.previous_scores / 100) * 20;
    score += (features.tutoring_sessions / 8) * 8;
    score += (features.physical_activity / 6) * 3;
    
    const ordinalMap: Record<string, number> = { 'Low': 0, 'Medium': 2.5, 'High': 5 };
    score += ordinalMap[features.parental_involvement] || 2.5;
    score += ordinalMap[features.access_to_resources] || 2.5;
    score += ordinalMap[features.motivation_level] || 2.5;
    
    if (features.internet_access) score += 2;
    if (features.peer_influence === 'Positive') score += 3;
    if (features.peer_influence === 'Negative') score -= 3;
    if (features.learning_disabilities) score -= 5;
    
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

function buildMockPredictionResult(score: number, features: StudentFeaturesPayload): PredictionResult {
    let risk_level: PredictionResult['risk_level'] = 'Medium Risk';
    if (score >= 75) risk_level = 'High Performer';
    else if (score < 60) risk_level = 'At Risk';
    
    return {
        predicted_score: score,
        risk_level,
        confidence: Math.min(92.0, Math.max(65.0, Math.round(75 + (score - 60) * 0.15))),
        model_used: 'Local Estimator (Offline)',
        feature_importances: mockImportances.map(f => ({
            feature: f.feature,
            display_name: f.display_name,
            importance: f.importance
        })),
        recommendations: generateRecommendations(features, score),
        created_at: new Date().toISOString(),
    };
}

function buildMockPrediction(): PredictionResult {
    return buildMockPredictionResult(mockPrediction.predicted_score, mockFeatures);
}

export interface PredictionHistoryItem {
    id: string;
    predicted_score: number;
    risk_level: 'At Risk' | 'Medium Risk' | 'High Performer';
    confidence: number;
    model_used: string;
    created_at: string;
}

export function usePrediction() {
    const { token } = useAuth();
    const [features, setFeatures] = useState<StudentFeaturesPayload>(DEFAULT_FEATURES);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [latestPredictionResult, setLatestPredictionResult] = useState<PredictionResult | null>(null);

    /**
     * Fetch cached data only — loads saved features + latest prediction from history.
     * Does NOT trigger a new ML prediction.
     */
    const fetchCached = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load features
            let userFeatures = DEFAULT_FEATURES;
            if (token) {
                try {
                    const dbFeatures = await apiGetMyFeatures(token);
                    if (dbFeatures) {
                        userFeatures = dbFeatures;
                    }
                } catch {
                    // No saved features yet — use defaults
                }
            }
            setFeatures(userFeatures);

            // Load latest prediction from history (no new ML call)
            let cachedPrediction: PredictionResult | null = null;
            let historyList: PredictionHistoryItem[] = [];
            if (token) {
                try {
                    const dbHistory = await apiGetPredictionHistory(token);
                    if (dbHistory && dbHistory.length > 0) {
                        historyList = dbHistory.map(item => ({
                            id: item.id,
                            predicted_score: item.predicted_score,
                            risk_level: item.risk_level as PredictionHistoryItem['risk_level'],
                            confidence: item.confidence,
                            model_used: item.model_used,
                            created_at: item.created_at,
                        }));
                        const latest = dbHistory[0];
                        // History only stores score/risk/confidence/model.
                        // Feature importances & recommendations are model-level constants,
                        // so we reconstruct them from the mock data (same coefficients).
                        cachedPrediction = {
                            predicted_score: latest.predicted_score,
                            risk_level: latest.risk_level as PredictionResult['risk_level'],
                            confidence: latest.confidence,
                            model_used: latest.model_used,
                            feature_importances: mockImportances.map((f) => ({
                                feature: f.feature,
                                display_name: f.display_name,
                                importance: f.importance,
                            })),
                            recommendations: generateRecommendations(userFeatures, latest.predicted_score),
                            created_at: latest.created_at,
                        };
                    }
                } catch (e) {
                    console.warn('Failed to load prediction history:', e);
                }
            }

            // If we have a cached prediction, use it; otherwise fall back to mock
            if (cachedPrediction) {
                setPrediction(cachedPrediction);
            } else {
                // No cached prediction exists (new user or never predicted)
                // Fall back to mock data so the UI isn't empty
                setPrediction(buildMockPrediction());
                if (!token) setError('Using offline data');
            }

            // Populate history with fallbacks if empty (e.g. offline/mock environment)
            if (historyList.length === 0) {
                historyList = [
                    {
                        id: 'pred-mock-1',
                        predicted_score: 67.4,
                        risk_level: 'Medium Risk',
                        confidence: 82.5,
                        model_used: 'Linear Regression',
                        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: 'pred-mock-2',
                        predicted_score: 62.1,
                        risk_level: 'Medium Risk',
                        confidence: 79.0,
                        model_used: 'Linear Regression',
                        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: 'pred-mock-3',
                        predicted_score: 58.5,
                        risk_level: 'At Risk',
                        confidence: 75.0,
                        model_used: 'Linear Regression',
                        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    }
                ];
            }
            setHistory(historyList);
        } catch (err) {
            console.warn('Failed to load cached data, using mock:', err);
            setPrediction(buildMockPrediction());
            setError('Using offline data');
            setHistory([
                {
                    id: 'pred-mock-1',
                    predicted_score: 67.4,
                    risk_level: 'Medium Risk',
                    confidence: 82.5,
                    model_used: 'Linear Regression',
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: 'pred-mock-2',
                    predicted_score: 62.1,
                    risk_level: 'Medium Risk',
                    confidence: 79.0,
                    model_used: 'Linear Regression',
                    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: 'pred-mock-3',
                    predicted_score: 58.5,
                    risk_level: 'At Risk',
                    confidence: 75.0,
                    model_used: 'Linear Regression',
                    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    /**
     * Explicitly trigger a new ML prediction.
     * Called after saving features in Profile or Onboarding.
     */
    const predictNow = useCallback(async (newFeatures?: StudentFeaturesPayload) => {
        const featuresToPredict = newFeatures || features;
        setError(null);
        setIsPredicting(true);
        setLatestPredictionResult(null);

        try {
            const result = await apiPredict(featuresToPredict, token);
            setPrediction(result);
            setLatestPredictionResult(result);
            if (newFeatures) {
                setFeatures(newFeatures);
            }

            // Append to history state
            const newHistoryItem: PredictionHistoryItem = {
                id: (result as any).id || `pred-${Date.now()}`,
                predicted_score: result.predicted_score,
                risk_level: result.risk_level,
                confidence: result.confidence,
                model_used: result.model_used,
                created_at: result.created_at || new Date().toISOString(),
            };
            setHistory(prev => [newHistoryItem, ...prev.filter(item => item.id !== newHistoryItem.id)]);

            return result;
        } catch (err) {
            console.warn('Prediction API unavailable:', err);
            setError('Prediction failed');
            setIsPredicting(false);
            return null;
        }
    }, [token, features]);

    /**
     * Close the prediction modal overlay.
     */
    const closePredictionModal = useCallback(() => {
        setIsPredicting(false);
        setLatestPredictionResult(null);
    }, []);

    /**
     * Run a sandboxed simulation of predictions without saving history in database.
     */
    const simulatePrediction = useCallback(async (simFeatures: StudentFeaturesPayload) => {
        try {
            // We pass null for the token to run a sandboxed prediction without saving to Supabase
            const result = await apiPredict(simFeatures, null);
            return result;
        } catch (err) {
            console.warn('Simulation API failed, estimating locally:', err);
            const score = estimateScoreLocally(simFeatures);
            return buildMockPredictionResult(score, simFeatures);
        }
    }, []);

    // On mount: load cached data only (no prediction call)
    useEffect(() => {
        fetchCached();
    }, [fetchCached]);

    return { features, prediction, history, isLoading, error, isPredicting, latestPredictionResult, predictNow, simulatePrediction, closePredictionModal, refresh: fetchCached };
}
