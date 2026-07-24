'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Youtube, Mail, Check } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const email = 'booung@jusik.app';

  const closePopover = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180); // match animation duration
  };

  const togglePopover = () => {
    if (isOpen) {
      if (isClosing) {
        setIsClosing(false);
      } else {
        closePopover();
      }
    } else {
      setIsClosing(false);
      setIsOpen(true);
    }
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

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePopover();
      }
    }
    if (isOpen && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isClosing]);

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
          
          {/* Left: Brand Name & Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#353535] shrink-0 group-hover:scale-105 transition-transform relative">
                <Image 
                  src="/logo.png" 
                  alt="jusik.app logo" 
                  width={36}
                  height={36}
                  className="w-full h-full object-cover rounded-full"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight font-mono text-[var(--text-primary)]">
                jusik.app
              </span>
            </Link>
          </div>

          {/* Right: Sub Brand Button with Dropdown Popover */}
          <div className="relative" ref={containerRef}>
            <button
              type="button"
              onClick={togglePopover}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 py-1.5 px-3.5 rounded-full glass-card glass-card-hover active:scale-95 shadow-2xs"
              title="주식부엉 정보 및 문의"
            >
              <span className="text-[11px] opacity-70">by</span>
              <span className="font-bold">주식부엉</span>
            </button>

            {/* Dropdown Popover Menu immediately below button with scale expand/shrink animation */}
            {isOpen && (
              <div 
                className={`absolute right-0 top-full mt-2 w-max max-w-[280px] sm:max-w-[320px] rounded-2xl p-2 glass-card shadow-2xl z-50 space-y-1 ${
                  isClosing ? 'animate-popover-shrink' : 'animate-popover-expand'
                }`}
              >
                {/* 1. YouTube Link Button */}
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

                {/* 2. Contact Email Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-start gap-2 px-3 py-2.5 rounded-xl glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap text-left group shadow-2xs"
                >
                  <Mail className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] shrink-0 transition-colors" />
                  <span className="whitespace-nowrap flex-1 font-sans group-hover:text-[var(--accent-orange)] transition-colors">메일로 문의하기</span>
                  <span className="shrink-0">
                    {copied ? (
                      <span className="text-[10px] font-bold text-[var(--accent-mid-green)] flex items-center gap-0.5 whitespace-nowrap font-sans">
                        <Check className="w-3 h-3" /> 복사됨
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-70 font-sans font-bold whitespace-nowrap">복사</span>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
