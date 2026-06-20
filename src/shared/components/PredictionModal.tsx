'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PredictionResult } from '@/lib/api';
import {
  Brain, ScanSearch, Sparkles, CheckCircle2, TrendingUp,
  Shield, BarChart3, ChevronRight,
} from 'lucide-react';

/* ───────── Stage config ───────── */
const STAGES = [
  { icon: ScanSearch, label: 'Analyzing your features', sublabel: 'Scanning 22 academic & lifestyle inputs…' },
  { icon: Brain, label: 'Running ML model', sublabel: 'Processing through trained neural network…' },
  { icon: BarChart3, label: 'Generating insights', sublabel: 'Calculating risk level & recommendations…' },
  { icon: Sparkles, label: 'Prediction ready', sublabel: 'Your personalized results are in!' },
];

const STAGE_DURATION = 900; // ms per stage

/* ───────── Types ───────── */
interface PredictionModalProps {
  isOpen: boolean;
  prediction: PredictionResult | null;
  onClose: () => void;
}

/* ───────── Component ───────── */
export function PredictionModal({ isOpen, prediction, onClose }: PredictionModalProps) {
  const [stage, setStage] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stageRef = useRef(0);

  // Ensure portal mounts client-side only
  useEffect(() => { setMounted(true); }, []);

  // Reset & drive stage animation
  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      stageRef.current = 0;
      setShowResult(false);
      setIsClosing(false);
      return;
    }

    // Advance through stages 0→1→2
    const advance = () => {
      if (stageRef.current < 2) {
        stageRef.current += 1;
        setStage(stageRef.current);
        timerRef.current = setTimeout(advance, STAGE_DURATION);
      }
    };
    timerRef.current = setTimeout(advance, STAGE_DURATION);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen]);

  // When prediction arrives AND we've reached stage 2, jump to complete
  useEffect(() => {
    if (prediction && isOpen && stage >= 2) {
      const t = setTimeout(() => {
        stageRef.current = 3;
        setStage(3);
        setTimeout(() => setShowResult(true), 400);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [prediction, isOpen, stage]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  if (!mounted || !isOpen) return null;

  const riskColor = prediction?.risk_level === 'High Performer'
    ? 'var(--accent-green)' : prediction?.risk_level === 'At Risk'
    ? 'var(--accent-red)' : 'var(--accent-amber)';

  const riskBg = prediction?.risk_level === 'High Performer'
    ? 'rgba(52,211,153,0.12)' : prediction?.risk_level === 'At Risk'
    ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)';

  return createPortal(
    <div
      className={`prediction-modal-backdrop ${isClosing ? 'prediction-modal-exit' : ''}`}
      onClick={(e) => { if (showResult && e.target === e.currentTarget) handleClose(); }}
    >
      {/* Ambient particles */}
      <div className="prediction-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="prediction-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Modal content */}
      <div className={`prediction-modal-card ${isClosing ? 'prediction-modal-card-exit' : ''}`}>

        {/* ─── Loading state ─── */}
        {!showResult && (
          <div className="prediction-loading-content">
            {/* Animated ring */}
            <div className="prediction-ring-container">
              <svg viewBox="0 0 120 120" className="prediction-ring-svg">
                {/* Background ring */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                {/* Progress ring */}
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="url(#prediction-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${((stage + 1) / 4) * 327} 327`}
                  className="prediction-ring-progress"
                />
                {/* Gradient def */}
                <defs>
                  <linearGradient id="prediction-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="50%" stopColor="var(--accent-purple)" />
                    <stop offset="100%" stopColor="var(--accent-green)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <div className="prediction-ring-icon">
                {(() => {
                  const Icon = STAGES[stage].icon;
                  return <Icon size={28} strokeWidth={1.5} />;
                })()}
              </div>
            </div>

            {/* Stage label */}
            <h2 className="prediction-stage-label" key={stage}>
              {STAGES[stage].label}
            </h2>
            <p className="prediction-stage-sublabel" key={`sub-${stage}`}>
              {STAGES[stage].sublabel}
            </p>

            {/* Stage dots */}
            <div className="prediction-stage-dots">
              {STAGES.map((_, i) => (
                <div key={i} className={`prediction-dot ${i <= stage ? 'prediction-dot-active' : ''} ${i === stage ? 'prediction-dot-current' : ''}`} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Result state ─── */}
        {showResult && prediction && (
          <div className="prediction-result-content">
            {/* Score display */}
            <div className="prediction-score-container">
              <div className="prediction-score-ring-wrap">
                <svg viewBox="0 0 140 140" className="prediction-score-svg">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <circle
                    cx="70" cy="70" r="60"
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(prediction.predicted_score / 100) * 377} 377`}
                    className="prediction-score-ring-fill"
                    style={{ filter: `drop-shadow(0 0 8px ${riskColor})` }}
                  />
                </svg>
                <div className="prediction-score-value">
                  <span className="prediction-score-number" style={{ color: riskColor }}>
                    {prediction.predicted_score.toFixed(1)}
                  </span>
                  <span className="prediction-score-unit">/ 100</span>
                </div>
              </div>
            </div>

            {/* Risk badge */}
            <div className="prediction-risk-badge" style={{ background: riskBg, color: riskColor, borderColor: riskColor }}>
              <Shield size={12} strokeWidth={2} />
              {prediction.risk_level}
            </div>

            {/* Stats row */}
            <div className="prediction-stats-row">
              <div className="prediction-stat-item">
                <TrendingUp size={14} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div className="prediction-stat-value">{prediction.confidence}%</div>
                  <div className="prediction-stat-label">Confidence</div>
                </div>
              </div>
              <div className="prediction-stat-divider" />
              <div className="prediction-stat-item">
                <Brain size={14} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <div className="prediction-stat-value">{prediction.model_used.split(' ')[0]}</div>
                  <div className="prediction-stat-label">Model</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleClose} className="prediction-cta-btn">
              <span>View Full Results</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
