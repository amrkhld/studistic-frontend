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
  TrendingUp, ArrowUp, ArrowDown, Minus, Sparkles,
} from 'lucide-react';
import { Menu } from '@/shared/components/Menu';
import { PredictionModal } from '@/shared/components/PredictionModal';
import { PremiumUpgradeModal } from '@/shared/components/PremiumUpgradeModal';

const PREDEFINED_COLLEGES = [
  'College of Computing & IT',
  'College of Engineering',
  'College of Business',
  'College of Science',
  'College of Humanities & Social Sciences',
  'College of Art & Design',
  'College of Medicine & Health Sciences',
];

export function ProfileView() {
  const { user, updateUser } = useAuth();
  const { features, prediction, history = [], isLoading, refresh } = usePrediction();
  const { saveAll, uploadAvatar, isUpdating, error: saveError, successMessage, clearMessages, isPredicting, latestPredictionResult, closePredictionModal } = useProfile();

  // ─── Edit mode state ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({
    full_name: '',
    department: '',
    year: 1,
  });
  const [editFeatures, setEditFeatures] = useState<StudentFeaturesPayload>({} as StudentFeaturesPayload);
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; item: any } | null>(null);
  const [isCustomActive, setIsCustomActive] = useState(false);

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
    const dept = user?.department || 'College of Computing & IT';
    setEditProfile({
      full_name: user?.full_name || '',
      department: dept,
      year: user?.year || 1,
    });
    setIsCustomActive(!!(dept && !PREDEFINED_COLLEGES.includes(dept)));
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
                      style={{ color: 'var(--text-muted)' }}>College / Faculty</label>
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
                          <span>{editProfile.department || 'Select College'}</span>
                          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      }
                      items={[
                        { label: 'College of Computing & IT', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Computing & IT' })); setIsCustomActive(false); } },
                        { label: 'College of Engineering', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Engineering' })); setIsCustomActive(false); } },
                        { label: 'College of Business', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Business' })); setIsCustomActive(false); } },
                        { label: 'College of Science', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Science' })); setIsCustomActive(false); } },
                        { label: 'College of Humanities & Social Sciences', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Humanities & Social Sciences' })); setIsCustomActive(false); } },
                        { label: 'College of Art & Design', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Art & Design' })); setIsCustomActive(false); } },
                        { label: 'College of Medicine & Health Sciences', onClick: () => { setEditProfile(prev => ({ ...prev, department: 'College of Medicine & Health Sciences' })); setIsCustomActive(false); } },
                        { label: 'Other (Custom...)', onClick: () => { setEditProfile(prev => ({ ...prev, department: '' })); setIsCustomActive(true); } }
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
                {(isCustomActive || (editProfile.department && !PREDEFINED_COLLEGES.includes(editProfile.department))) && (
                  <div className="mt-3 animate-fade-in">
                    <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: 'var(--text-muted)' }}>
                      Specify College Name
                    </label>
                    <input
                      type="text"
                      value={editProfile.department}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter custom college name..."
                      className="px-3 py-2 rounded-xl text-[13px] outline-none w-full max-w-[320px]"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                )}
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

          {/* Prediction History & Score Progression */}
          <div className="glass p-6 animate-slide-up stagger-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
                <h3 className="text-[13px] font-semibold">Prediction History & Score Progression</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Progression Analysis</span>
            </div>

            {history.length > 0 ? (
              <>
                {/* Visual Chart */}
                <div className="relative w-full h-[280px] md:h-[320px] mb-6 select-none bg-white/[0.01] rounded-2xl border border-white/[0.03] p-4">
                  <svg viewBox="0 0 1200 300" width="100%" height="100%" className="overflow-visible">
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--accent-cyan)" />
                        <stop offset="100%" stopColor="var(--accent-purple)" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {(() => {
                      const chronologicalHistory = [...history].reverse();
                      const scores = chronologicalHistory.map(h => h.predicted_score);
                      const rawMin = Math.min(...scores);
                      const rawMax = Math.max(...scores);
                      const minScore = Math.max(0, Math.floor(rawMin - 5));
                      const maxScore = Math.min(100, Math.ceil(rawMax + 5));
                      const scoreRange = maxScore - minScore || 10;

                      const paddingLeft = 50;
                      const paddingRight = 30;
                      const paddingTop = 30;
                      const paddingBottom = 40;

                      const gridLines = Array.from({ length: 4 }).map((_, idx) => {
                        const value = minScore + (idx / 3) * scoreRange;
                        const y = paddingTop + (1 - (value - minScore) / scoreRange) * 230;
                        return { y, value: Math.round(value) };
                      });

                      const points = chronologicalHistory.map((h, i) => {
                        const x = chronologicalHistory.length > 1
                          ? paddingLeft + (i / (chronologicalHistory.length - 1)) * 1120
                          : paddingLeft + 560;
                        const y = paddingTop + (1 - (h.predicted_score - minScore) / scoreRange) * 230;
                        return { x, y, item: h };
                      });

                      const linePath = points.length > 0
                        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                        : '';

                      const areaPath = points.length > 0
                        ? `${linePath} L ${points[points.length - 1].x} ${300 - paddingBottom} L ${points[0].x} ${300 - paddingBottom} Z`
                        : '';

                      const labelIndices = points.length <= 5
                        ? points.map((_, i) => i)
                        : [0, Math.floor(points.length / 2), points.length - 1];

                      return (
                        <>
                          {/* Grid Lines */}
                          {gridLines.map((line, idx) => (
                            <g key={`grid-${idx}`}>
                              <line x1={paddingLeft} y1={line.y} x2={1200 - paddingRight} y2={line.y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1} strokeDasharray="3,3" />
                              <text x={paddingLeft - 10} y={line.y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end" className="font-mono">
                                {line.value}
                              </text>
                            </g>
                          ))}

                          {/* Gradient Area */}
                          {areaPath && <path d={areaPath} fill="url(#chart-area-grad)" />}

                          {/* Line Path */}
                          {linePath && <path d={linePath} fill="none" stroke="url(#chart-line-grad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}

                          {/* Point Circles */}
                          {points.map((p, idx) => {
                            const isHovered = hoveredPoint?.item.id === p.item.id;
                            const riskColor = p.item.risk_level === 'High Performer'
                              ? 'var(--accent-green)' : p.item.risk_level === 'At Risk'
                              ? 'var(--accent-red)' : 'var(--accent-amber)';

                            return (
                              <g key={`point-${idx}`}>
                                {/* Hover Target */}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={16}
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredPoint(p)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                                {/* Glow backdrop for hovered point */}
                                {isHovered && (
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={10}
                                    fill={riskColor}
                                    opacity={0.35}
                                    className="transition-all duration-150 pointer-events-none"
                                  />
                                )}
                                {/* Visible Point */}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isHovered ? 6.5 : 5}
                                  fill={riskColor}
                                  stroke="#080d1f"
                                  strokeWidth={1.5}
                                  className="transition-all duration-150 pointer-events-none"
                                />
                              </g>
                            );
                          })}

                          {/* X Axis Date Labels */}
                          {points.map((p, idx) => {
                            if (!labelIndices.includes(idx)) return null;
                            const dateStr = new Date(p.item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return (
                              <text key={`lbl-${idx}`} x={p.x} y={300 - 12} fill="var(--text-muted)" fontSize="11" textAnchor="middle">
                                {dateStr}
                              </text>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>

                  {/* HTML Tooltip overlay */}
                  {hoveredPoint && (
                    <div
                      className="absolute p-3 rounded-xl pointer-events-none z-20 flex flex-col gap-1 shadow-2xl transition-all duration-150"
                      style={{
                        left: `${(hoveredPoint.x / 1200) * 100}%`,
                        top: `${(hoveredPoint.y / 300) * 100}%`,
                        transform: 'translate(-50%, calc(-100% - 15px))',
                        minWidth: 150,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(12, 16, 51, 0.95)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {new Date(hoveredPoint.item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Score</span>
                        <span className="text-[12px] font-bold font-mono" style={{ color: 'var(--accent-cyan)' }}>
                          {hoveredPoint.item.predicted_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Risk</span>
                        <span className="text-[11px] font-semibold" style={{ color: hoveredPoint.item.risk_level === 'High Performer' ? 'var(--accent-green)' : hoveredPoint.item.risk_level === 'At Risk' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                          {hoveredPoint.item.risk_level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                        <span className="text-[11px] font-semibold font-mono" style={{ color: 'var(--accent-purple)' }}>
                          {hoveredPoint.item.confidence}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date & Time</th>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Model</th>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Confidence</th>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Risk Level</th>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Predicted Score</th>
                        <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Progression</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, idx) => {
                        const olderItem = history[idx + 1];
                        const diff = olderItem ? item.predicted_score - olderItem.predicted_score : null;

                        const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });

                        const timeStr = new Date(item.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <tr
                            key={item.id}
                            className="transition-colors hover:bg-white/[0.015]"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          >
                            <td className="py-3 text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                              <div>{dateStr}</div>
                              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeStr}</div>
                            </td>
                            <td className="py-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                              {item.model_used}
                            </td>
                            <td className="py-3 text-[12px] font-mono" style={{ color: 'var(--accent-purple)' }}>
                              {item.confidence}%
                            </td>
                            <td className="py-3">
                              <div className={getRiskBadgeClass(item.risk_level)}>
                                {item.risk_level}
                              </div>
                            </td>
                            <td className="py-3 text-[13px] font-bold text-right font-mono" style={{ color: 'var(--foreground)' }}>
                              {item.predicted_score.toFixed(1)}
                            </td>
                            <td className="py-3 text-right">
                              {diff !== null ? (
                                <div className="flex items-center justify-end gap-1 text-[11px] font-bold font-mono">
                                  {diff > 0 ? (
                                    <>
                                      <ArrowUp size={11} strokeWidth={2.5} style={{ color: 'var(--accent-green)' }} />
                                      <span style={{ color: 'var(--accent-green)' }}>+{diff.toFixed(1)}</span>
                                    </>
                                  ) : diff < 0 ? (
                                    <>
                                      <ArrowDown size={11} strokeWidth={2.5} style={{ color: 'var(--accent-red)' }} />
                                      <span style={{ color: 'var(--accent-red)' }}>{diff.toFixed(1)}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Minus size={11} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
                                      <span style={{ color: 'var(--text-muted)' }}>0.0</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                  Baseline
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No previous predictions recorded.</p>
              </div>
            )}
          </div>

          {/* Premium Subscription Section */}
          {!user?.is_premium ? (
            /* Free Tier Advertising Banner */
            <div className="glass p-6 animate-slide-up stagger-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/[0.04] bg-white/[0.01]"
              style={{
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.05)',
              }}>
              {/* Decorative blobs */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)' }} />

              <div className="relative z-10 flex-1 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                  <Sparkles size={10} className="animate-pulse" />
                  Limited Offer: Upgrade to Pro
                </div>
                <h3 className="text-[16px] font-bold" style={{ color: 'var(--foreground)' }}>
                  Unlock the full potential of Studistic's AI core
                </h3>
                <p className="text-[12px] max-w-[580px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Unlock real-time academic advising with our AI Consultant, receive dynamic recommendations curated by Gemini 2.0, and manage AI-suggested weekly tasks on your Kanban board.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--accent-cyan)' }}>
                    <CheckCircle2 size={13} strokeWidth={2} /> AI Academic Consultant
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--accent-purple)' }}>
                    <CheckCircle2 size={13} strokeWidth={2} /> LLM Recommendations
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--accent-green)' }}>
                    <CheckCircle2 size={13} strokeWidth={2} /> AI Suggested Kanban Cards
                  </span>
                </div>
              </div>

              <div className="relative z-10 shrink-0 text-center md:text-right flex flex-col items-center md:items-end gap-2.5">
                <div className="text-[18px] font-bold" style={{ color: 'var(--foreground)' }}>
                  $4.99<span className="text-[12px] font-normal" style={{ color: 'var(--text-muted)' }}> / month</span>
                </div>
                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer text-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    boxShadow: '0 4px 16px rgba(56, 189, 248, 0.25)',
                  }}
                >
                  Unlock Studistic Pro
                </button>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mock billing system active</span>
              </div>
            </div>
          ) : (
            /* Premium Tier Status Card */
            <div className="glass p-6 animate-slide-up stagger-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/[0.04] bg-white/[0.01]">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%)' }} />

              <div className="relative z-10 flex-1 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--accent-green)] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)]">
                  <CheckCircle2 size={10} />
                  Subscription Active
                </div>
                <h3 className="text-[16px] font-bold flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                  Studistic Pro
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    }}>
                    PRO TIER
                  </span>
                </h3>
                <p className="text-[12px] max-w-[580px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your account is upgraded to the Mock Academic Plan. You have unlimited access to all premium ML models, progression tracking tools, and AI recommendation widgets.
                </p>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Next mock renewal date: {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="relative z-10 shrink-0 text-center md:text-right flex flex-col items-center md:items-end gap-2.5">
                <button
                  onClick={() => updateUser({ is_premium: false })}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer border border-red-500/20 text-[#f87171] hover:bg-red-500/10"
                >
                  Downgrade to Free
                </button>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Instantly cancel & reset state</span>
              </div>
            </div>
          )}
        </>
      )}
      {/* Prediction Modal */}
      <PredictionModal
        isOpen={isPredicting}
        prediction={latestPredictionResult}
        onClose={handleModalClose}
      />
      {/* Upgrade Checkout Modal */}
      {isUpgradeOpen && (
        <PremiumUpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}
    </div>
  );
}
