
import React, { useState, useEffect, useRef } from 'react';

interface BloomingRoseProps {
  color: string;
  isBlooming: boolean;
  onBloomComplete?: () => void;
}

export const BloomingRose: React.FC<BloomingRoseProps> = ({ color, isBlooming, onBloomComplete }) => {
  const [stage, setStage] = useState(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sped up organic blooming sequence
  useEffect(() => {
    if (isBlooming && stage < 12) {
      // Much shorter delays (total ~1.1s)
      const delays = [100, 80, 80, 70, 70, 70, 60, 60, 60, 50, 50, 300];
      const timer = setTimeout(() => {
        setStage(s => s + 1);
      }, delays[stage]);
      return () => clearTimeout(timer);
    } else if (stage === 12 && onBloomComplete) {
      onBloomComplete();
    }
  }, [isBlooming, stage, onBloomComplete]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      setRotation({ x: -y, y: x });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const getTheme = (c: string) => {
    switch (c) {
      case 'Pink': return { primary: '#ec4899', secondary: '#9d174d', light: '#fdf2f8', dark: '#500724' };
      case 'Yellow': return { primary: '#eab308', secondary: '#854d0e', light: '#fefce8', dark: '#422006' };
      case 'White': return { primary: '#f8fafc', secondary: '#475569', light: '#ffffff', dark: '#0f172a' };
      case 'Blue': return { primary: '#3b82f6', secondary: '#1e3a8a', light: '#eff6ff', dark: '#172554' };
      default: return { primary: '#dc2626', secondary: '#7f1d1d', light: '#fef2f2', dark: '#450a0a' };
    }
  };

  const theme = getTheme(color);

  const Petal = ({ idx, rotate, scale, opacity }: { idx: number, rotate: number, scale: number, opacity: number }) => {
    const isVisible = stage >= idx;
    const s = isVisible ? scale : 0;
    
    return (
      <path
        d="M100,100 C130,50 170,70 180,110 C185,140 150,180 100,190 C50,180 15,140 20,110 C30,70 70,50 100,100"
        fill={`url(#petal-grad-${idx % 3})`}
        style={{
          transform: `scale(${s}) rotate(${rotate}deg)`,
          opacity: isVisible ? opacity : 0,
          transition: `transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.4s ease`,
          transformOrigin: '100px 100px',
        }}
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] flex items-center justify-center transition-transform duration-150 ease-out"
      style={{ transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
    >
      <div 
        className={`absolute inset-0 blur-[100px] rounded-full transition-all duration-1000 ${isBlooming ? 'scale-100 opacity-30' : 'scale-50 opacity-0'}`}
        style={{ background: `radial-gradient(circle, ${theme.primary}, transparent)` }}
      />

      <svg viewBox="0 0 200 200" className="w-full h-full filter-rose">
        <defs>
          <radialGradient id="petal-grad-0" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.light} />
            <stop offset="100%" stopColor={theme.secondary} />
          </radialGradient>
          <radialGradient id="petal-grad-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.secondary} />
          </radialGradient>
          <radialGradient id="petal-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.light} />
            <stop offset="100%" stopColor={theme.primary} />
          </radialGradient>
          <filter id="p-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        <g className={`transition-all duration-500 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <path d="M100,160 C100,200 110,230 80,260" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        <g filter="url(#p-shadow)">
          <Petal idx={1} rotate={0} scale={1.1} opacity={0.6} />
          <Petal idx={2} rotate={72} scale={1.05} opacity={0.7} />
          <Petal idx={3} rotate={144} scale={1.1} opacity={0.6} />
          <Petal idx={4} rotate={216} scale={1.05} opacity={0.7} />
          <Petal idx={5} rotate={288} scale={1.1} opacity={0.6} />
          <Petal idx={6} rotate={36} scale={0.85} opacity={0.9} />
          <Petal idx={7} rotate={108} scale={0.8} opacity={1} />
          <Petal idx={8} rotate={180} scale={0.85} opacity={0.9} />
          <Petal idx={9} rotate={252} scale={0.8} opacity={1} />
          <Petal idx={10} rotate={0} scale={0.5} opacity={1} />
          <Petal idx={11} rotate={120} scale={0.45} opacity={1} />
          <Petal idx={12} rotate={240} scale={0.4} opacity={1} />
        </g>
      </svg>
    </div>
  );
};
