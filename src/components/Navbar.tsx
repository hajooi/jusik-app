import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
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
            {/* Owl Logo Icon - Circular Container */}
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

          {/* Right: Sub Brand Link: by 주식부엉 */}
          <a
            href="https://youtube.com/@주식부엉"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors py-1.5 px-3.5 rounded-full bg-[var(--card-surface)]/80 backdrop-blur-sm active:scale-95"
            title="유튜브 '주식부엉' 채널로 이동"
          >
            <span className="text-[11px] opacity-70">by</span>
            <span className="font-bold">주식부엉</span>
          </a>
        </div>
      </div>
    </header>
  );
}
