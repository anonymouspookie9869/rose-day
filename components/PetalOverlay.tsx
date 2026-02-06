
import React, { useEffect, useState } from 'react';
import { RoseColor } from '../types';

interface PetalProps {
  left: number;
  delay: number;
  duration: number;
  size: number;
  isHeart: boolean;
  color: string;
}

const Petal: React.FC<PetalProps> = ({ left, delay, duration, size, isHeart, color }) => {
  return (
    <div
      className="petal-falling"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {isHeart ? (
        <svg viewBox="0 0 24 24" fill={color} className="opacity-40">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" fill={color} className="opacity-50">
          <path d="M50,0 C60,20 90,30 90,60 C90,85 70,100 50,100 C30,100 10,85 10,60 C10,30 40,20 50,0 Z" />
        </svg>
      )}
    </div>
  );
};

export const PetalOverlay: React.FC<{ roseColor?: RoseColor }> = ({ roseColor }) => {
  const [elements, setElements] = useState<any[]>([]);

  const getPetalColor = (rc?: RoseColor) => {
    switch (rc) {
      case RoseColor.RED: return '#f87171';
      case RoseColor.PINK: return '#fbcfe8';
      case RoseColor.YELLOW: return '#fef08a';
      case RoseColor.WHITE: return '#f1f5f9';
      case RoseColor.BLUE: return '#93c5fd';
      default: return '#fecaca';
    }
  };

  useEffect(() => {
    const newElements = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 6 + Math.random() * 10,
      size: 12 + Math.random() * 18,
      isHeart: Math.random() > 0.5
    }));
    setElements(newElements);
  }, [roseColor]);

  const color = getPetalColor(roseColor);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-[1]">
      {elements.map((el) => (
        <Petal key={el.id} {...el} color={color} />
      ))}
    </div>
  );
};
