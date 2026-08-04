'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookmarkCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthPopover from '@/components/AuthPopover';
import AdminModal from '@/components/AdminModal';

export default function Navbar() {
  const { user, isAuthPopoverOpen, toggleAuthPopover, closeAuthPopover } = useAuth();
  const authPopoverRef = useRef<HTMLDivElement>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleToggleAuth = () => {
    toggleAuthPopover();
  };

  // Close auth popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authPopoverRef.current && !authPopoverRef.current.contains(event.target as Node)) {
        closeAuthPopover();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAuthPopover]);

  return (
    <>
      <header className="sticky top-0 z-50 transition-all duration-200">
        {/* iOS Progressive Glass Blur Layer */}
        <div 
          className="absolute inset-x-0 top-0 -bottom-3 bg-[var(--bg-main)]/65 backdrop-blur-md pointer-events-none transition-all"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left: Clean jusik.app Brand Title */}
            <Link href="/" className="flex items-center group">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-mono text-[var(--text-primary)]">
                jusik.app
              </span>
            </Link>

            {/* Right: Record / Account Button */}
            <div className="relative" ref={authPopoverRef}>
              <button
                type="button"
                onClick={handleToggleAuth}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-all duration-300 py-1.5 px-3 sm:px-3.5 rounded-full glass-card glass-card-hover active:scale-95 shadow-2xs border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_15px_rgba(241,143,1,0.2)] cursor-pointer"
                title={user ? `${user.nickname}님의 기록` : '내 기록 보관 / 로그인'}
              >
                {user ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                ) : (
                  <BookmarkCheck className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                )}
                <span className="truncate max-w-[80px] sm:max-w-[110px] text-[11px] sm:text-xs">
                  {user ? user.nickname : '내 기록'}
                </span>
                
                {/* Eye-catching subtle orange pulse dot when not logged in */}
                {!user && (
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent-orange)]"></span>
                  </span>
                )}
              </button>

              {/* Natural Dropdown Popover attached to Button */}
              {isAuthPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <AuthPopover 
                    onClose={closeAuthPopover} 
                    onOpenAdmin={() => setIsAdminModalOpen(true)}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Admin Mini Dashboard Modal */}
      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
    </>
  );
}
