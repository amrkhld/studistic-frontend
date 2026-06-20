'use client';

import '@/app/onboarding-slider.css';
import { StudentFeaturesPayload } from '@/lib/api';
import { Slider, Pills, Toggle } from '@/shared/components/FormControls';
import {
    Clock, Target, Moon, BookOpen, Dumbbell, GraduationCap,
} from 'lucide-react';

/**
 * Feature editing form — sliders, pills, and toggles for all 19 student features.
 * Reuses the same visual style as the onboarding wizard.
 */
export function ProfileEditForm({
    features,
    onChange,
}: {
    features: StudentFeaturesPayload;
    onChange: <K extends keyof StudentFeaturesPayload>(key: K, value: StudentFeaturesPayload[K]) => void;
}) {
    return (
        <div className="space-y-6">
            {/* ─── Numeric Features (Sliders) ─── */}
            <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: 'var(--text-muted)' }}>
                    Study Habits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <Slider label="Hours Studied / Week" value={features.hours_studied}
                        onChange={(v) => onChange('hours_studied', v)} min={0} max={44} unit="h" icon={Clock} />
                    <Slider label="Attendance Rate" value={features.attendance}
                        onChange={(v) => onChange('attendance', v)} min={0} max={100} unit="%" icon={Target} />
                    <Slider label="Previous Exam Scores" value={features.previous_scores}
                        onChange={(v) => onChange('previous_scores', v)} min={0} max={100} unit="" icon={BookOpen} />
                    <Slider label="Sleep Hours / Night" value={features.sleep_hours}
                        onChange={(v) => onChange('sleep_hours', v)} min={3} max={12} unit="h" icon={Moon} />
                    <Slider label="Tutoring Sessions / Mo" value={features.tutoring_sessions}
                        onChange={(v) => onChange('tutoring_sessions', v)} min={0} max={8} unit="" icon={GraduationCap} />
                    <Slider label="Physical Activity / Wk" value={features.physical_activity}
                        onChange={(v) => onChange('physical_activity', v)} min={0} max={6} unit="h" icon={Dumbbell} />
                </div>
            </div>

            {/* ─── Categorical Features (Pills) ─── */}
            <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: 'var(--text-muted)' }}>
                    Environment & Support
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Pills label="Parental Involvement" options={['Low', 'Medium', 'High']}
                        value={features.parental_involvement} onChange={(v) => onChange('parental_involvement', v)} />
                    <Pills label="Access to Resources" options={['Low', 'Medium', 'High']}
                        value={features.access_to_resources} onChange={(v) => onChange('access_to_resources', v)} />
                    <Pills label="Motivation Level" options={['Low', 'Medium', 'High']}
                        value={features.motivation_level} onChange={(v) => onChange('motivation_level', v)} />
                    <Pills label="Family Income" options={['Low', 'Medium', 'High']}
                        value={features.family_income} onChange={(v) => onChange('family_income', v)} />
                    <Pills label="Teacher Quality" options={['Low', 'Medium', 'High']}
                        value={features.teacher_quality} onChange={(v) => onChange('teacher_quality', v)} />
                    <Pills label="Peer Influence" options={['Negative', 'Neutral', 'Positive']}
                        value={features.peer_influence} onChange={(v) => onChange('peer_influence', v)} />
                </div>
            </div>

            {/* ─── Personal Details ─── */}
            <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: 'var(--text-muted)' }}>
                    Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Pills label="Gender" options={['Male', 'Female']}
                        value={features.gender} onChange={(v) => onChange('gender', v)} cols={2} />
                    <Pills label="School Type" options={['Public', 'Private']}
                        value={features.school_type} onChange={(v) => onChange('school_type', v)} cols={2} />
                    <Pills label="Distance from Home" options={['Near', 'Moderate', 'Far']}
                        value={features.distance_from_home} onChange={(v) => onChange('distance_from_home', v)} />
                    <Pills label="Parent Education" options={['High School', 'College', 'Postgraduate']}
                        value={features.parental_education_level} onChange={(v) => onChange('parental_education_level', v)} />
                    <Toggle label="Internet Access" value={features.internet_access}
                        onChange={(v) => onChange('internet_access', v)} />
                    <Toggle label="Extracurricular Activities" value={features.extracurricular_activities}
                        onChange={(v) => onChange('extracurricular_activities', v)} />
                    <div className="md:col-span-2">
                        <Toggle label="Learning Disabilities" value={features.learning_disabilities}
                            onChange={(v) => onChange('learning_disabilities', v)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
