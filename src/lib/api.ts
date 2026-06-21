/**
 * Studistic — API Client
 * Base fetch wrapper for communicating with the FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
    token?: string | null;
}

/**
 * Generic fetch wrapper with auth token support.
 */
export async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((customHeaders as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...rest,
    });

    if (response.status === 401 && token) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('studistic_token');
            window.location.href = '/login?expired=true';
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
    return apiFetch<{
        access_token: string;
        user_id: string;
        email: string;
        full_name: string | null;
    }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function apiRegister(data: {
    email: string;
    password: string;
    full_name: string;
    department?: string;
    year?: number;
}) {
    return apiFetch<{
        access_token: string;
        user_id: string;
        email: string;
        full_name: string | null;
    }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function apiGetMe(token: string) {
    return apiFetch<{
        id: string;
        email: string;
        full_name: string;
        department: string;
        year: number;
        avatar_url?: string;
        created_at: string;
    }>('/auth/me', { token });
}

export interface ProfileUpdate {
    full_name?: string;
    department?: string;
    year?: number;
    avatar_url?: string;
}

export async function apiUpdateProfile(data: ProfileUpdate, token: string) {
    return apiFetch<{
        id: string;
        email: string;
        full_name: string;
        department: string;
        year: number;
        avatar_url?: string;
        created_at: string;
    }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
    });
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export interface PredictionResult {
    predicted_score: number;
    risk_level: 'At Risk' | 'Medium Risk' | 'High Performer';
    confidence: number;
    model_used: string;
    feature_importances: { feature: string; display_name: string; importance: number }[];
    recommendations: { id: number; title: string; description: string; priority: string; icon: string }[];
    created_at: string;
}

export interface StudentFeaturesPayload {
    hours_studied: number;
    attendance: number;
    sleep_hours: number;
    previous_scores: number;
    tutoring_sessions: number;
    physical_activity: number;
    parental_involvement: string;
    access_to_resources: string;
    extracurricular_activities: boolean;
    motivation_level: string;
    internet_access: boolean;
    family_income: string;
    teacher_quality: string;
    school_type: string;
    peer_influence: string;
    learning_disabilities: boolean;
    parental_education_level: string;
    distance_from_home: string;
    gender: string;
}

export async function apiPredict(features: StudentFeaturesPayload, token?: string | null) {
    return apiFetch<PredictionResult>('/predictions/predict', {
        method: 'POST',
        body: JSON.stringify(features),
        token,
    });
}

export async function apiGetPredictionHistory(token: string) {
    return apiFetch<{
        id: string;
        predicted_score: number;
        risk_level: string;
        confidence: number;
        model_used: string;
        created_at: string;
    }[]>('/predictions/history', { token });
}

// ─── Student Features ────────────────────────────────────────────────────────

export async function apiGetMyFeatures(token: string) {
    return apiFetch<StudentFeaturesPayload & { user_id: string }>('/students/me/features', { token });
}

export async function apiUpdateMyFeatures(features: StudentFeaturesPayload, token: string) {
    return apiFetch<StudentFeaturesPayload & { user_id: string }>('/students/me/features', {
        method: 'PUT',
        body: JSON.stringify(features),
        token,
    });
}

// ─── Grades ──────────────────────────────────────────────────────────────────

export interface GradeData {
    id: string;
    user_id: string;
    course_name: string;
    course_code: string;
    grade: string;
    score: number;
    semester: string;
    credit_hours: number;
}

export async function apiGetGrades(token: string) {
    return apiFetch<GradeData[]>('/grades/', { token });
}

export async function apiUploadAvatar(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
    };
    
    // We explicitly do NOT set Content-Type so the browser sets it to multipart/form-data with boundaries
    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }

    return response.json() as Promise<{ avatar_url: string }>;
}

export async function apiAddGrade(grade: Omit<GradeData, 'id' | 'user_id'>, token: string) {
    return apiFetch<GradeData>('/grades/', {
        method: 'POST',
        body: JSON.stringify(grade),
        token,
    });
}

export async function apiDeleteGrade(gradeId: string, token: string) {
    return apiFetch<{ status: string }>(`/grades/${gradeId}`, {
        method: 'DELETE',
        token,
    });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface TaskData {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'high' | 'medium' | 'low';
    due_date?: string;
}

export async function apiGetTasks(token: string) {
    return apiFetch<TaskData[]>('/tasks/', { token });
}

export async function apiCreateTask(
    task: Omit<TaskData, 'id' | 'user_id'>,
    token: string
) {
    return apiFetch<TaskData>('/tasks/', {
        method: 'POST',
        body: JSON.stringify(task),
        token,
    });
}

export async function apiUpdateTask(
    taskId: string,
    updates: Partial<Omit<TaskData, 'id' | 'user_id'>>,
    token: string
) {
    return apiFetch<TaskData>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        token,
    });
}

export async function apiDeleteTask(taskId: string, token: string) {
    return apiFetch<{ status: string }>(`/tasks/${taskId}`, {
        method: 'DELETE',
        token,
    });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface DatasetStats {
    total_students: number;
    avg_exam_score: number;
    avg_attendance: number;
    avg_hours_studied: number;
    avg_sleep_hours: number;
    avg_previous_scores: number;
    avg_physical_activity: number;
    avg_tutoring_sessions: number;
}

export interface RiskDistItem {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

export async function apiGetDatasetStats() {
    return apiFetch<DatasetStats>('/stats/dataset');
}

export async function apiGetRiskDistribution() {
    return apiFetch<RiskDistItem[]>('/stats/risk-distribution');
}

// ─── Gemini AI Services ──────────────────────────────────────────────────────

export interface GeminiRecommendation {
    id: number;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

export interface GeminiSuggestedTask {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    due_date: string;
}

export async function apiAskGeminiConsultant(
    query: string,
    features: StudentFeaturesPayload | null,
    predictedScore: number | null,
    token: string
) {
    return apiFetch<{ answer: string }>('/gemini/consultant', {
        method: 'POST',
        body: JSON.stringify({ query, features, predicted_score: predictedScore }),
        token,
    });
}

export async function apiGetGeminiRecommendations(
    features: StudentFeaturesPayload,
    predictedScore: number,
    token: string
) {
    return apiFetch<GeminiRecommendation[]>('/gemini/recommendations', {
        method: 'POST',
        body: JSON.stringify({ features, predicted_score: predictedScore }),
        token,
    });
}

export async function apiGetGeminiSuggestedTasks(
    features: StudentFeaturesPayload,
    predictedScore: number,
    token: string
) {
    return apiFetch<GeminiSuggestedTask[]>('/gemini/suggested-tasks', {
        method: 'POST',
        body: JSON.stringify({ features, predicted_score: predictedScore }),
        token,
    });
}

