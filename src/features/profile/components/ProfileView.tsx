'use client';

import '@/app/prediction-modal.css';

import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePrediction } from '@/shared/hooks/usePrediction';
import { useProfile } from '@/shared/hooks/useProfile';
import { StudentFeaturesPayload } from '@/lib/api';
import { getRiskBadgeClass } from '@/lib/mock-data';
import { LoadingPage } from '@/shared/components/LoadingSkeleton';
import { ProfileEditForm } from './ProfileEditForm';
import {
  Mail, Calendar, GraduationCap, Shield, MapPin,
  Pencil, X, Save, Loader2, CheckCircle2, AlertCircle, ChevronDown,
} from 'lucide-react';
import { Menu } from '@/shared/components/Menu';
import { PredictionModal } from '@/shared/components/PredictionModal';

export function ProfileView() {
  const { user } = useAuth();
  const { features, prediction, isLoading, refresh } = usePrediction();
  const { saveAll, uploadAvatar, isUpdating, error: saveError, successMessage, clearMessages, isPredicting, latestPredictionResult, closePredictionModal } = useProfile();

  // ─── Edit mode state ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({
    full_name: '',
    department: '',
    year: 1,
  });
  const [editFeatures, setEditFeatures] = useState<StudentFeaturesPayload>({} as StudentFeaturesPayload);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      // useProfile hook handles the error state
    } finally {
      setIsUploading(false);
    }
  };

  // Enter edit mode — snapshot current data
  const startEditing = useCallback(() => {
    setEditProfile({
      full_name: user?.full_name || '',
      department: user?.department || 'Information Systems',
      year: user?.year || 1,
    });
    setEditFeatures({ ...features });
    clearMessages();
    setIsEditing(true);
  }, [user, features, clearMessages]);

  // Cancel edit — revert to original data
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    clearMessages();
  }, [clearMessages]);

  // Save changes — profile + features + auto-predict
  const handleSave = useCallback(async () => {
    const result = await saveAll(
      {
        full_name: editProfile.full_name,
        department: editProfile.department,
        year: editProfile.year,
      },
      editFeatures,
    );

    if (result) {
      // Prediction succeeded — refresh cached data and exit edit mode
      // (modal will handle the display, then onClose refreshes)
      setIsEditing(false);
    }
  }, [saveAll, editProfile, editFeatures]);

  // Handle modal close — refresh cached prediction data
  const handleModalClose = useCallback(async () => {
    closePredictionModal();
    await refresh();
  }, [closePredictionModal, refresh]);

  // Feature change handler for edit form
  const handleFeatureChange = useCallback(<K extends keyof StudentFeaturesPayload>(
    key: K, value: StudentFeaturesPayload[K]
  ) => {
    setEditFeatures(prev => ({ ...prev, [key]: value }));
  }, []);

  // ─── Loading state ────────────────────────────────────────────────
  if (isLoading || !prediction) {
    return <LoadingPage />;
  }

  const displayName = isEditing ? editProfile.full_name : (user?.full_name || 'Student User');
  const displayDept = isEditing ? editProfile.department : (user?.department || 'Information Systems');
  const displayYear = isEditing ? editProfile.year : (user?.year || 1);
  const displayFeatures = isEditing ? editFeatures : features;
  const initials = (user?.full_name || 'S U').split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Profile</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isEditing ? 'Edit your information and student features' : 'Your personal information and academic overview'}
          </p>
        </div>
        {!isEditing ? (
          <button onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer btn-minimal"
            style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <Pencil size={13} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={cancelEditing} disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer btn-minimal"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={13} /> Cancel
            </button>
            <button onClick={handleSave} disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer btn-minimal"
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                color: '#fff',
                opacity: isUpdating ? 0.7 : 1,
                cursor: isUpdating ? 'not-allowed' : 'pointer',
              }}>
              {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </header>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="p-3 rounded-xl text-[12px] font-medium animate-slide-up flex items-center gap-2"
          style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.12)' }}>
          <CheckCircle2 size={14} /> {successMessage}
        </div>
      )}
      {saveError && (
        <div className="p-3 rounded-xl text-[12px] font-medium animate-slide-up flex items-center gap-2"
          style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.12)' }}>
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      {/* Profile Card */}
      <div className={`glass p-6 animate-slide-up stagger-1 relative ${isEditing ? 'z-30' : 'z-10'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Avatar */}
          <div className="relative group w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden cursor-pointer"
            style={{ 
              background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', 
              color: '#fff' 
            }}>
            {!user?.avatar_url && initials}
            
            {/* Hover overlay for upload */}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
               {isUploading ? <Loader2 size={18} className="animate-spin text-white" /> : <Pencil size={18} className="text-white" />}
               <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block"
                    style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    type="text"
                    value={editProfile.full_name}
                    onChange={(e) => setEditProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full max-w-[320px] px-3 py-2 rounded-xl text-[13px] outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
                {/* Department & Year */}
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block"
                      style={{ color: 'var(--text-muted)' }}>Department</label>
                    <Menu
                      align="left"
                      fullWidthDropdown
                      trigger={
                        <div 
                          className="px-3 py-2 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5 min-w-[240px]"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <span>{editProfile.department || 'Select Department'}</span>
                          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      }
                      items={[
                        { label: 'Information Systems', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Information Systems' })) },
                        { label: 'Computer Science', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Computer Science' })) },
                        { label: 'Software Engineering', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Software Engineering' })) },
                        { label: 'Data Science', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Data Science' })) },
                        { label: 'Cybersecurity', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Cybersecurity' })) },
                        { label: 'Other', onClick: () => setEditProfile(prev => ({ ...prev, department: 'Other' })) }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block"
                      style={{ color: 'var(--text-muted)' }}>Year</label>
                    <Menu
                      align="left"
                      fullWidthDropdown
                      trigger={
                        <div 
                          className="px-3 py-2 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5 min-w-[100px]"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <span>Year {editProfile.year}</span>
                          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      }
                      items={[1, 2, 3, 4, 5, 6].map(y => ({
                        label: `Year ${y}`,
                        onClick: () => setEditProfile(prev => ({ ...prev, year: y }))
                      }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-[17px] font-semibold" style={{ color: 'var(--foreground)' }}>{displayName}</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    { icon: GraduationCap, text: displayDept },
                    { icon: Calendar, text: `Year ${displayYear}` },
                    { icon: Mail, text: user?.email || 'student@studistic.com' },
                  ].map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      <item.icon size={13} strokeWidth={1.5} /> {item.text}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className={getRiskBadgeClass(prediction.risk_level)}>{prediction.risk_level}</div>
          )}
        </div>
      </div>

      {/* ─── Edit Mode: Feature Form ─── */}
      {isEditing ? (
        <div className="glass p-6 animate-slide-up stagger-2">
          <h3 className="text-[14px] font-semibold mb-5 flex items-center gap-2">
            <Pencil size={14} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
            Edit Student Features
          </h3>
          <ProfileEditForm features={editFeatures} onChange={handleFeatureChange} />
        </div>
      ) : (
        /* ─── Display Mode: Read-only cards ─── */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Academic */}
            <div className="glass p-6 animate-slide-up stagger-2">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2">
                <Shield size={14} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} /> Academic Profile
              </h3>
              <div className="space-y-0">
                {[
                  { label: 'Hours Studied/Week', value: `${displayFeatures.hours_studied}h` },
                  { label: 'Attendance Rate', value: `${displayFeatures.attendance}%` },
                  { label: 'Previous Scores', value: `${displayFeatures.previous_scores}` },
                  { label: 'Sleep Hours', value: `${displayFeatures.sleep_hours}h` },
                  { label: 'Physical Activity', value: `${displayFeatures.physical_activity}h/week` },
                  { label: 'Tutoring Sessions', value: `${displayFeatures.tutoring_sessions}` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="glass p-6 animate-slide-up stagger-3">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2">
                <MapPin size={14} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} /> Environment & Background
              </h3>
              <div className="space-y-0">
                {[
                  { label: 'Parental Involvement', value: displayFeatures.parental_involvement },
                  { label: 'Family Income', value: displayFeatures.family_income },
                  { label: 'Internet Access', value: displayFeatures.internet_access ? 'Yes' : 'No' },
                  { label: 'School Type', value: displayFeatures.school_type },
                  { label: 'Distance from Home', value: displayFeatures.distance_from_home },
                  { label: 'Learning Disabilities', value: displayFeatures.learning_disabilities ? 'Yes' : 'No' },
                  { label: 'Extracurricular', value: displayFeatures.extracurricular_activities ? 'Yes' : 'No' },
                  { label: 'Parental Education', value: displayFeatures.parental_education_level },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="text-[12px] font-semibold"
                      style={{
                        color: item.value === 'High' || item.value === 'Yes' || item.value === 'Positive' || item.value === 'Private' ? 'var(--accent-green)'
                          : item.value === 'Low' || item.value === 'No' || item.value === 'Negative' ? 'var(--accent-red)'
                            : 'var(--foreground)',
                      }}
                    >{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Prediction */}
          <div className="glass p-6 animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold">Latest Prediction</h3>
              {prediction.created_at && (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(prediction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Predicted Score', value: prediction.predicted_score.toFixed(1), color: 'var(--accent-cyan)' },
                { label: 'Risk Level', value: prediction.risk_level, color: prediction.risk_level === 'High Performer' ? 'var(--accent-green)' : prediction.risk_level === 'At Risk' ? 'var(--accent-red)' : 'var(--accent-amber)' },
                { label: 'Confidence', value: `${prediction.confidence}%`, color: 'var(--accent-purple)' },
                { label: 'Model', value: prediction.model_used, color: 'var(--text-secondary)' },
              ].map((item) => (
                <div key={item.label} className="glass-subtle text-center p-4">
                  <div className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-[16px] font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Prediction Modal */}
      <PredictionModal
        isOpen={isPredicting}
        prediction={latestPredictionResult}
        onClose={handleModalClose}
      />
    </div>
  );
}
