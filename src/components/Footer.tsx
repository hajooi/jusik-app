'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Youtube, Mail, Check, ChevronDown } from 'lucide-react';

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const footerRef = useRef<HTMLDivElement>(null);
  const email = 'booung@jusik.app';

  const toggleFooterMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      window.location.href = `mailto:${email}`;
    } catch (err) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      window.location.href = `mailto:${email}`;
    }
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <footer ref={footerRef} className="w-full pt-6 pb-24 mt-4 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center space-y-2">
        
        {/* Ultra-Minimal Interactive Brand Identity Button (Explicit Click Only) */}
        <button
          type="button"
          onClick={toggleFooterMenu}
          className="group inline-flex items-baseline gap-1.5 font-mono text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer py-1.5 px-3 rounded-full hover:bg-[var(--card-hover)] active:scale-95 border border-transparent hover:border-[var(--border-color)]"
          title="클릭하여 채널 및 문의 보기"
        >
          <span className="font-black text-[var(--text-primary)] tracking-tight text-sm sm:text-base">jusik.app</span>
          <span className="opacity-60">by</span>
          <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
            주식부엉
          </span>
          <ChevronDown 
            className={`w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] transition-transform duration-300 self-center ${
              isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''
            }`} 
          />
        </button>

        {/* Butter-Smooth Accordion Slide Animation Container */}
        <div 
          className={`grid transition-all duration-300 ease-out w-full ${
            isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-center gap-3 flex-wrap py-1">
              {/* YouTube Link Button */}
              <a
                href="https://youtube.com/@주식부엉"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 border border-[var(--border-color)]"
              >
                <Youtube className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                <span>주식부엉 유튜브</span>
              </a>

              {/* Email Contact & Auto Copy Button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer border border-[var(--border-color)]"
                title="클릭 시 이메일 복사 및 문의"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                    <span className="text-[var(--accent-green)] font-mono">{email} (복사됨 ✓)</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                    <span>메일로 문의하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
