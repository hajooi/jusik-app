'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Youtube, Mail, Check, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthPopover from '@/components/AuthPopover';

export default function Navbar() {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isSubMenuClosing, setIsSubMenuClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user, isAuthPopoverOpen, toggleAuthPopover, closeAuthPopover } = useAuth();

  const subMenuRef = useRef<HTMLDivElement>(null);
  const authPopoverRef = useRef<HTMLDivElement>(null);

  const email = 'booung@jusik.app';

  const closeSubMenu = () => {
    setIsSubMenuClosing(true);
    setTimeout(() => {
      setIsSubMenuOpen(false);
      setIsSubMenuClosing(false);
    }, 180);
  };

  const toggleSubMenu = () => {
    if (isAuthPopoverOpen) closeAuthPopover();
    if (isSubMenuOpen) {
      closeSubMenu();
    } else {
      setIsSubMenuOpen(true);
    }
  };

  const handleToggleAuth = () => {
    if (isSubMenuOpen) closeSubMenu();
    toggleAuthPopover();
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  };

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target as Node)) {
        closeSubMenu();
      }
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
    <header className="sticky top-0 z-50 transition-all duration-200">
      {/* iOS Progressive Blur Background */}
      <div 
        className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-md pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Jusik.app Brand + Inline 'by 주식부엉' text with doubled spacing */}
          <div className="flex items-baseline gap-3.5 sm:gap-4 relative" ref={subMenuRef}>
            <Link href="/" className="flex items-baseline group">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-mono text-[var(--text-primary)]">
                jusik.app
              </span>
            </Link>

            {/* Inline text style with comfortable double gap */}
            <button
              type="button"
              onClick={toggleSubMenu}
              className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] opacity-70 hover:opacity-100 hover:text-[var(--accent-orange)] transition-all cursor-pointer inline-flex items-baseline gap-0.5 py-0.5"
              title="주식부엉 정보 및 문의"
            >
              <span>by</span>
              <span className="font-bold">주식부엉</span>
            </button>

            {/* Sub Menu Dropdown Menu attached to 'by 주식부엉' */}
            {isSubMenuOpen && (
              <div 
                className={`absolute left-0 top-full mt-2 w-max max-w-[280px] sm:max-w-[320px] rounded-2xl p-2 glass-card shadow-2xl z-50 space-y-1 ${
                  isSubMenuClosing ? 'animate-popover-shrink' : 'animate-popover-expand'
                }`}
              >
                {/* YouTube Link Button */}
                <a
                  href="https://youtube.com/@주식부엉"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-start gap-2 px-3 py-2.5 rounded-xl bg-[var(--accent-orange)]/15 hover:bg-[var(--accent-orange)] text-[var(--accent-orange)] hover:text-white font-bold text-xs sm:text-sm transition-all duration-300 group whitespace-nowrap text-left shadow-2xs"
                >
                  <Youtube className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap flex-1">주식부엉 유튜브</span>
                  <span className="text-xs opacity-70 group-hover:translate-x-0.5 transition-transform shrink-0">→</span>
                </a>

                {/* Contact Email Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-start gap-2 px-3 py-2.5 rounded-xl glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap text-left group shadow-2xs cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] shrink-0 transition-colors" />
                  <span className="whitespace-nowrap flex-1 font-sans group-hover:text-[var(--accent-orange)] transition-colors">메일로 문의하기</span>
                  <span className="shrink-0 font-sans font-bold text-xs">
                    {copied ? (
                      <span className="text-[var(--accent-green)] flex items-center gap-0.5 whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" /> 복사됨
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)] opacity-70 whitespace-nowrap">복사</span>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>

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
                <AuthPopover onClose={closeAuthPopover} />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
