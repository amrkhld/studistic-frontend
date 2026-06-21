'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import Logo from '@/assets/general/logo-transparent.png';
import {
  LayoutDashboard,
  User,
  KanbanSquare,
  GraduationCap,
  PieChart,
  ArrowRightLeft,
  LogOut,
  MoreVertical,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { Menu } from '@/shared/components/Menu';
import { PremiumUpgradeModal } from '@/shared/components/PremiumUpgradeModal';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'To-Study', href: '/to-study', icon: KanbanSquare },
  { name: 'Grades', href: '/grades', icon: GraduationCap },
  { name: 'Percentages', href: '/percentages', icon: PieChart },
  { name: 'Comparisons', href: '/comparisons', icon: ArrowRightLeft },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, user, updateUser } = useAuth();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <aside className="glass-sidebar rounded-2xl w-[230px] min-w-[220px] flex flex-col py-6 px-5 m-4">
        {/* Logo */}
        <div className="logo">
          <Image
            src={Logo}
            alt="Studistic"
            className="w-full h-auto p-2"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${!isActive ? 'nav-item-hover' : ''}`}
                style={{
                  color: isActive ? '#fff' : 'rgba(200, 210, 255, 0.55)',
                  background: isActive ? 'rgba(56, 189, 248, 0.10)' : 'transparent',
                }}
              >
                <item.icon
                  size={17}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-colors duration-200"
                  style={{
                    color: isActive ? '#38bdf8' : 'rgba(200, 210, 255, 0.4)',
                  }}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#38bdf8',
                      boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card (shown for free tier users) */}
        {isAuthenticated && user && !user.is_premium && (
          <div className="glass p-4 mb-4 mt-2 relative overflow-hidden flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01]"
            style={{
              boxShadow: '0 8px 32px rgba(56, 189, 248, 0.03)',
            }}>
            {/* Decorative glowing blob */}
            <div className="absolute -top-12 -right-12 w-20 h-20 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)' }} />
            
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: 'var(--accent-purple)' }} className="animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Studistic Pro</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Unlock advanced predictions & unlimited tracking.
            </p>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="w-full py-1.5 rounded-lg text-[10.5px] font-bold transition-all duration-200 cursor-pointer text-center text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.15)',
              }}
            >
              Get Premium
            </button>
          </div>
        )}

        {/* User info + Menu */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="pt-4 mt-4 w-full">
          {isAuthenticated && user && (
            <Menu
              align="left"
              position="top"
              className="w-full"
              trigger={
                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden bg-cover bg-center"
                    style={{ 
                      background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', 
                      color: '#fff' 
                    }}>
                    {!user.avatar_url && (user.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left flex-1">
                    <div className="text-[12px] font-medium truncate group-hover:text-[var(--accent-cyan)] transition-colors flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                      <span className="truncate">{user.full_name}</span>
                      {user.is_premium && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider text-white shrink-0 scale-90"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                            boxShadow: '0 0 10px rgba(167, 139, 250, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                          }}>
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <MoreVertical size={14} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              }
              items={
                user.is_premium
                  ? [
                      { label: 'Profile', icon: <User size={14} />, onClick: () => router.push('/profile') },
                      { label: 'Downgrade (Reset)', icon: <ArrowDown size={14} />, onClick: () => updateUser({ is_premium: false }) },
                      { label: 'Logout', icon: <LogOut size={14} />, onClick: handleLogout, variant: 'danger' }
                    ]
                  : [
                      { label: 'Profile', icon: <User size={14} />, onClick: () => router.push('/profile') },
                      { label: 'Logout', icon: <LogOut size={14} />, onClick: handleLogout, variant: 'danger' }
                    ]
              }
            />
          )}
        </div>
      </aside>

      {/* Upgrade checkout wizard modal */}
      {isUpgradeOpen && (
        <PremiumUpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}
    </>
  );
}
