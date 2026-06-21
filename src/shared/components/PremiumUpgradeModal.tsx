'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  Sparkles, CheckCircle2, Zap, TrendingUp, Brain,
  CreditCard, Lock, X, Loader2
} from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const { updateUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [status, setStatus] = useState<'checkout' | 'processing' | 'success'>('checkout');

  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Ensure portal mounts client-side only
  useEffect(() => {
    setMounted(true);
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Reset status when opened, clean up timers when closed
  useEffect(() => {
    if (isOpen) {
      setStatus('checkout');
      setIsClosing(false);
    } else {
      clearAllTimers();
    }
  }, [isOpen, clearAllTimers]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleSubscribe = useCallback(() => {
    setStatus('processing');
    
    // Simulate transaction
    processingTimerRef.current = setTimeout(() => {
      setStatus('success');
      
      // Auto-update state & close after showing success for 1.8 seconds
      successTimerRef.current = setTimeout(() => {
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
          updateUser({ is_premium: true });
          onClose();
        }, 300);
      }, 1800);
    }, 2000);
  }, [updateUser, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`prediction-modal-backdrop ${isClosing ? 'prediction-modal-exit' : ''}`}
      onClick={(e) => {
        // Only allow clicking backdrop to close when in checkout phase
        if (status === 'checkout' && e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Floating particles */}
      <div className="prediction-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="prediction-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Card */}
      <div className={`prediction-modal-card !w-[420px] ${isClosing ? 'prediction-modal-card-exit' : ''}`}>
        
        {/* Close Button (only in checkout stage) */}
        {status === 'checkout' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}

        {/* ─── Stage 1: Checkout ─── */}
        {status === 'checkout' && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-2.5 rounded-2xl mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))',
                  border: '1px solid rgba(167, 139, 250, 0.2)'
                }}>
                <Sparkles size={24} style={{ color: 'var(--accent-purple)' }} className="animate-pulse" />
              </div>
              <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                Upgrade to Studistic Pro
              </h2>
              <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                Unleash the full potential of AI-driven academic optimization.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {[
                {
                  icon: Brain,
                  title: 'AI Academic Consultant',
                  desc: 'Ask specific questions about study strategies, time management, or sleep habits to receive real-time coaching advice.'
                },
                {
                  icon: Zap,
                  title: 'LLM-Powered Recommendations',
                  desc: 'Get personalized recommendations generated dynamically by Gemini 2.0 based on your unique academic feature profile.'
                },
                {
                  icon: CheckCircle2,
                  title: 'AI Suggested Kanban Cards',
                  desc: 'Receive suggested actionable tasks on your Kanban board and confirm them to save them directly to Supabase in one click.'
                }
              ].map((b, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <div className="mt-0.5 shrink-0">
                    <b.icon size={16} strokeWidth={1.5} style={{ color: i === 0 ? 'var(--accent-cyan)' : i === 1 ? 'var(--accent-purple)' : 'var(--accent-green)' }} />
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-semibold" style={{ color: 'var(--foreground)' }}>{b.title}</h4>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Section */}
            <div className="glass-subtle p-3.5 rounded-xl flex items-center justify-between mb-6"
              style={{ border: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(56, 189, 248, 0.02)' }}>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-semibold block" style={{ color: 'var(--accent-cyan)' }}>STUDISTIC ACADEMIC PRO</span>
                <span className="text-[18px] font-bold" style={{ color: 'var(--foreground)' }}>$4.99<span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] block" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Mock Billing Tier</span>
                <span className="text-[9px] block" style={{ color: 'var(--text-muted)' }}>Cancel anytime in settings</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleSubscribe}
              className="prediction-cta-btn !py-3 font-semibold text-[13px] flex items-center justify-center gap-2"
            >
              <CreditCard size={15} />
              <span>Subscribe & Upgrade</span>
            </button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Lock size={10} />
              <span>Simulated Sandbox Environment — No real credit card details required.</span>
            </div>
          </div>
        )}

        {/* ─── Stage 2: Processing ─── */}
        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            {/* Spinning Loader */}
            <div className="relative w-16 h-16 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#checkout-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="180 250"
                />
                <defs>
                  <linearGradient id="checkout-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-purple)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard size={20} style={{ color: 'var(--accent-cyan)' }} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-[15px] font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              Securing mock payment...
            </h3>
            <p className="text-[11.5px] max-w-[260px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Verifying credentials through our secure academic simulation gateway.
            </p>
          </div>
        )}

        {/* ─── Stage 3: Success ─── */}
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            {/* Checkmark icon with growing ripple */}
            <div className="relative w-16 h-16 mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)'
              }}>
              <CheckCircle2 size={32} style={{ color: 'var(--accent-green)' }} className="scale-100 transition-transform duration-300" />
            </div>
            
            <h3 className="text-[16px] font-bold mb-1" style={{ color: 'var(--accent-green)' }}>
              Upgrade Successful!
            </h3>
            <p className="text-[12px] max-w-[250px] leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Welcome to <strong>Studistic Pro</strong>. Your premium academic insights are now unlocked.
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-full text-[10px]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              Redirecting you to dashboard...
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
