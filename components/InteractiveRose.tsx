
import React, { useMemo } from 'react';

interface InteractiveRoseProps {
  isBloomed: boolean;
  colorTheme?: string;
}

const AnimatedPhrase: React.FC<{ text: string; active: boolean; delayBase: number; charDelay: number; className: string }> = ({ 
  text, 
  active, 
  delayBase, 
  charDelay,
  className 
}) => {
  return (
    <span className={`block ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-all duration-[2000ms] transform ${
            active 
              ? 'opacity-100 translate-y-0 blur-0' 
              : 'opacity-0 translate-y-4 blur-md'
          }`}
          style={{ 
            transitionDelay: active ? `${delayBase + (i * charDelay)}ms` : '0ms',
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export const InteractiveRose: React.FC<InteractiveRoseProps> = ({ isBloomed }) => {
  // Generate random particle properties once
  const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 160 - 30}%`,
    left: `${Math.random() * 160 - 30}%`,
    size: Math.random() * 3 + 2,
    delay: `${Math.random() * 5}s`,
    duration: `${2 + Math.random() * 3}s`
  })), []);

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <style>{`
        @keyframes twinkle-sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 0.8; }
        }
        .shimmer-particle {
          animation: twinkle-sparkle var(--duration) infinite ease-in-out;
          animation-delay: var(--delay);
        }
      `}</style>
      
      <div className={`rose-container transition-transform duration-1000 relative ${isBloomed ? 'scale-150' : 'scale-100'}`}>
        {/* Shimmer Particles - Only visible when bloomed */}
        {isBloomed && particles.map(p => (
          <div
            key={p.id}
            className="shimmer-particle absolute rounded-full bg-white z-0 pointer-events-none shadow-[0_0_8px_#fff,0_0_12px_#ff69b4]"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--delay': p.delay,
              '--duration': p.duration,
            } as React.CSSProperties}
          />
        ))}

        {Array.from({ length: 30 }).map((_, i) => {
          const idx = i + 1;
          const initialScale = 0.02 * idx;
          const initialRotate = 80 * idx;
          const bloomedScale = 0.06 * idx;
          const bloomedRotate = (80 * idx) + (3 * idx);
          
          return (
            <div
              key={i}
              className="rose-petal"
              style={{
                zIndex: 30 - i,
                transform: isBloomed 
                  ? `scale(${bloomedScale}) rotate(${bloomedRotate}deg)` 
                  : `scale(${initialScale}) rotate(${initialRotate}deg)`
              }}
            />
          );
        })}
        
        {/* Refined Animated Text Overlay - Split into 3 lines with reduced font sizes */}
        <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <div className="text-center w-[300px] -ml-[100px] flex flex-col items-center">
            <AnimatedPhrase 
              text="Happy" 
              active={isBloomed} 
              delayBase={400} 
              charDelay={80}
              className="text-white font-romantic text-3xl drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] italic leading-tight"
            />
            <AnimatedPhrase 
              text="Rose Day" 
              active={isBloomed} 
              delayBase={1000} 
              charDelay={80}
              className="text-white font-romantic text-3xl drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] italic leading-tight"
            />
            <AnimatedPhrase 
              text="Vanshika" 
              active={isBloomed} 
              delayBase={1800} 
              charDelay={120}
              className="text-white font-bold text-5xl tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] mt-2"
            />
          </div>
        </div>
      </div>
      
      {!isBloomed && (
        <span className="font-romantic text-red-900 text-4xl animate-pulse tracking-widest mt-24 px-4 text-center">
          Touch here my love...
        </span>
      )}
    </div>
  );
};
