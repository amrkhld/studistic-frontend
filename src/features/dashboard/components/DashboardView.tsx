'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { usePrediction } from '@/shared/hooks/usePrediction';
import { useStats } from '@/shared/hooks/useStats';
import { getRiskBadgeClass, getRiskColor } from '@/lib/mock-data';
import { LoadingPage } from '@/shared/components/LoadingSkeleton';
import { useState } from 'react';
import {
  TrendingUp,
  Clock,
  BookOpen,
  Moon,
  Target,
  Activity,
  Lightbulb,
  Sparkles,
  Lock,
  Send,
  Loader2,
} from 'lucide-react';
import { apiAskGeminiConsultant } from '@/lib/api';
import { PremiumUpgradeModal } from '@/shared/components/PremiumUpgradeModal';

export function DashboardView() {
  const { user, token } = useAuth();
  const { features, prediction, isLoading: predLoading } = usePrediction();
  const { stats, isLoading: statsLoading } = useStats();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleAskConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !token) return;

    setIsPending(true);
    try {
      const res = await apiAskGeminiConsultant(query, features, prediction?.predicted_score || null, token);
      setAnswer(res.answer);
    } catch (err) {
      console.error(err);
      setAnswer('Sorry, the AI consultant could not process your query at this time. Please check your connection.');
    } finally {
      setIsPending(false);
    }
  };

  if (predLoading || statsLoading || !prediction || !stats) {
    return <LoadingPage />;
  }

  const riskColor = getRiskColor(prediction.risk_level);
  const scorePercent = Math.min(prediction.predicted_score, 100);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in ">
      {/* Welcome Section */}
      {user && (
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-cover bg-center shrink-0"
               style={{
                 background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                 color: '#fff',
               }}>
            {!user.avatar_url && (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Welcome back, {user.full_name.split(' ')[0]}!
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Here's your performance overview for today.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2 mt-8">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Performance Dashboard
          </h2>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            AI-powered predictions based on your academic data
          </p>
        </div>
        <div className={getRiskBadgeClass(prediction.risk_level)}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor, display: 'inline-block' }} />
          {prediction.risk_level}
        </div>
      </header>

      {/* Top — AI Consultant + Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AI Consultant */}
        <div className="lg:col-span-8 glass p-6 relative overflow-hidden animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} />
            <h2 className="text-[14px] font-semibold">Studistic AI Consultant</h2>
          </div>
          
          {!user?.is_premium ? (
            <div className="text-center py-4 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <Lock size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <p className="text-[12px] leading-relaxed max-w-[220px]" style={{ color: 'var(--text-secondary)' }}>
                Unlock personalized academic advice and smart questions with Studistic Pro.
              </p>
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                }}
              >
                Unlock AI Coach
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Ask about your study habits, performance tips, or exam prep strategies.
              </p>
              <form onSubmit={handleAskConsultant} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. How can I balance study and sleep?"
                  disabled={isPending}
                  className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none transition-colors border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--foreground)'
                  }}
                />
                <button
                  type="submit"
                  disabled={isPending || !query.trim()}
                  className="px-3 py-2 rounded-xl font-bold text-[12px] transition-all cursor-pointer text-white shrink-0 flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    opacity: isPending || !query.trim() ? 0.7 : 1,
                  }}
                >
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Ask
                </button>
              </form>
              
              {answer && (
                <div className="glass-subtle p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] animate-fade-in max-h-36 overflow-y-auto">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={11} style={{ color: 'var(--accent-cyan)' }} />
                    <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)' }}>AI Advisor Response</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-[var(--foreground)]" style={{ whiteSpace: 'pre-line' }}>
                    {answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prediction */}
        <div className="lg:col-span-4 glass glow-cyan p-6 animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Predicted Score
            </span>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-[48px] font-bold leading-none tracking-tight" style={{ color: riskColor }}>
              {prediction.predicted_score.toFixed(1)}
            </span>
            <span className="text-[15px] mb-1.5 font-light" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="metric-bar mb-3">
            <div className="metric-bar-fill" style={{ width: `${scorePercent}%`, background: `linear-gradient(90deg, ${riskColor}, var(--accent-purple))` }} />
          </div>
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>{prediction.model_used}</span>
            <span>{prediction.confidence}% confidence</span>
          </div>
        </div>
      </div>

      {/* Mid — Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${features.attendance}%`, target: '90%+', icon: Target, color: 'var(--accent-cyan)', pct: features.attendance },
          { label: 'Study Hours', value: `${features.hours_studied}h`, target: '30h/wk', icon: Clock, color: 'var(--accent-green)', pct: (features.hours_studied / 44) * 100 },
          { label: 'Prev. Scores', value: `${features.previous_scores}`, target: 'Avg: 75', icon: BookOpen, color: 'var(--accent-amber)', pct: features.previous_scores },
          { label: 'Sleep', value: `${features.sleep_hours}h`, target: '7\u20138h ideal', icon: Moon, color: 'var(--accent-purple)', pct: (features.sleep_hours / 10) * 100 },
        ].map((m, i) => (
          <div key={m.label} className={`glass p-5 animate-slide-up stagger-${i + 3}`}>
            <m.icon size={16} strokeWidth={1.5} style={{ color: m.color, marginBottom: 12 }} />
            <div className="text-[22px] font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{m.value}</div>
            <div className="text-[11px] font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
            </div>
            <div className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{m.target}</div>
          </div>
        ))}
      </div>

      {/* Bottom — Feature Importance + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Feature Importance */}
        <div className="lg:col-span-7 glass p-6 animate-slide-up stagger-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
              <h2 className="text-[14px] font-semibold">Top Performance Factors</h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Model Analysis</span>
          </div>
          <div className="space-y-3.5">
            {prediction.feature_importances.slice(0, 7).map((f, i) => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="text-[12px] w-[110px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {f.display_name}
                </span>
                <div className="flex-1 metric-bar">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${(f.importance / prediction.feature_importances[0].importance) * 100}%`,
                      background: i < 3
                        ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))'
                        : 'rgba(56, 189, 248, 0.35)',
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono w-[40px] text-right" style={{ color: 'var(--text-muted)' }}>
                  {(f.importance * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-5 glass p-6 animate-slide-up stagger-8">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb size={15} strokeWidth={1.5} style={{ color: 'var(--accent-amber)' }} />
            <h2 className="text-[14px] font-semibold">Recommendations</h2>
          </div>
          <div className="space-y-2.5">
            {prediction.recommendations.map((rec) => (
              <div key={rec.id} className="glass-subtle p-3.5 flex items-start gap-3">
                <span className="text-[18px] mt-0.5 shrink-0">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{rec.title}</div>
                  <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{rec.description}</div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: rec.priority === 'high' ? 'rgba(248,113,113,0.1)' : rec.priority === 'medium' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                    color: rec.priority === 'high' ? '#f87171' : rec.priority === 'medium' ? '#fbbf24' : '#34d399',
                  }}
                >{rec.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom — Factor Profile */}
      <div className="glass p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="text-[14px] font-semibold">Your Factor Profile</h2>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Compared to {stats.total_students.toLocaleString()} students
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Motivation', value: features.motivation_level },
            { label: 'Parental Support', value: features.parental_involvement },
            { label: 'Resources', value: features.access_to_resources },
            { label: 'Teacher Quality', value: features.teacher_quality },
            { label: 'School Type', value: features.school_type },
            { label: 'Peer Influence', value: features.peer_influence },
          ].map((f) => (
            <div key={f.label} className="glass-subtle text-center p-3.5">
              <div className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
              <div className="text-[13px] font-semibold"
                style={{
                  color: f.value === 'High' || f.value === 'Positive' || f.value === 'Private' ? 'var(--accent-green)'
                    : f.value === 'Low' || f.value === 'Negative' ? 'var(--accent-red)'
                      : 'var(--accent-amber)',
                }}
              >{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {isUpgradeOpen && (
        <PremiumUpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      )}
    </div>
  );
}
