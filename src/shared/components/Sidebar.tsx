'use client';

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
} from 'lucide-react';
import { Menu } from '@/shared/components/Menu';

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
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
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
                  <div className="text-[12px] font-medium truncate group-hover:text-[var(--accent-cyan)] transition-colors" style={{ color: 'var(--foreground)' }}>{user.full_name}</div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <MoreVertical size={14} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            }
            items={[
              { label: 'Profile', icon: <User size={14} />, onClick: () => router.push('/profile') },
              { label: 'Logout', icon: <LogOut size={14} />, onClick: handleLogout, variant: 'danger' }
            ]}
          />
        )}
      </div>
    </aside>
  );
}
