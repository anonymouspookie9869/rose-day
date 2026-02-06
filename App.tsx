
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RoseColor, RoseWish } from './types';
import { getRoseDayWish, getRoseImagePath } from './services/geminiService';
import { PetalOverlay } from './components/PetalOverlay';
import { InteractiveRose } from './components/InteractiveRose';
import HeartCanvas from './components/HeartCanvas';
import { Heart, Sparkles, Flower2, ArrowRight, RotateCcw, Star, Music4, Quote, Pause, VolumeX } from 'lucide-react';

type Step = 'intro' | 'choice' | 'blooming' | 'reveal';

interface TrailItem {
  id: number;
  x: number;
  y: number;
  scale: number;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Explicit relative path for the audio
const CUSTOM_SONG_URL = './assets/audio.mp3'; 
const RECIPIENT_NAME = "Vanshika";

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('intro');
  const [selectedColor, setSelectedColor] = useState<RoseColor>(RoseColor.RED);
  const [selectingColor, setSelectingColor] = useState<RoseColor | null>(null);
  const [wish, setWish] = useState<RoseWish | null>(null);
  const [isRoseBloomed, setIsRoseBloomed] = useState(false);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [loadingText, setLoadingText] = useState("Preparing our garden...");
  
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isCustomSongPlaying, setIsCustomSongPlaying] = useState(false);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(CUSTOM_SONG_URL);
    audio.loop = true;
    customAudioRef.current = audio;
    
    return () => {
      audio.pause();
      customAudioRef.current = null;
    };
  }, []);

  const playHoverSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, []);

  const spawnHearts = (e: any) => {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (!x || !y) return;
    const colors = ['#f87171', '#f472b6', '#fb7185', '#ef4444'];
    const newHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setFloatingHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1500);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const id = Date.now();
    setTrail(prev => [...prev.slice(-10), { id, x, y, scale: Math.random() * 0.5 + 0.3 }]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const handleChoice = (color: RoseColor) => {
    setSelectingColor(color);
    setTimeout(() => {
      setSelectedColor(color);
      setStep('blooming');
      setIsRoseBloomed(false);
      setWish({
        recipient: RECIPIENT_NAME,
        relation: "Soulmate",
        vibe: 'Romantic',
        message: getRoseDayWish(RECIPIENT_NAME, color),
        imageUrl: getRoseImagePath(color)
      });
      
      const messages = ["Gathering the freshest roses...", "Adding your favorite colors...", "Almost ready, Vanshika..."];
      let mIdx = 0;
      const interval = setInterval(() => {
        setLoadingText(messages[mIdx % messages.length]);
        mIdx++;
        if (mIdx >= messages.length) clearInterval(interval);
      }, 1000);
      setSelectingColor(null);
    }, 450);
  };

  const handleBloomTouch = (e: any) => {
    spawnHearts(e);
    setIsRoseBloomed(true);
    setTimeout(() => setStep('reveal'), 4500);
  };

  const toggleCustomSong = (e?: any) => {
    if (e) {
      e.stopPropagation();
      spawnHearts(e);
    }
    if (!customAudioRef.current) return;
    
    if (isCustomSongPlaying) {
      customAudioRef.current.pause();
      setIsCustomSongPlaying(false);
    } else {
      customAudioRef.current.play().catch(err => console.warn(err));
      setIsCustomSongPlaying(true);
    }
  };

  const getBgColor = () => {
    if (step === 'intro') return 'bg-black';
    switch (selectedColor) {
      case RoseColor.RED: return 'bg-red-50';
      case RoseColor.PINK: return 'bg-pink-50';
      case RoseColor.YELLOW: return 'bg-yellow-50';
      case RoseColor.WHITE: return 'bg-slate-50';
      case RoseColor.BLUE: return 'bg-blue-50';
      default: return 'bg-white';
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onClick={spawnHearts}
      className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-x-hidden transition-all duration-1000 cursor-none select-none ${getBgColor()}`}>
      
      <PetalOverlay roseColor={step !== 'intro' ? selectedColor : undefined} />

      {trail.map(t => (
        <div key={t.id} className="absolute pointer-events-none z-[100] animate-sparkle-trail" style={{ left: t.x, top: t.y, transform: `translate(-50%, -50%) scale(${t.scale})` }}>
          <Star size={14} className="text-pink-400 fill-pink-200 opacity-60" />
        </div>
      ))}
      {floatingHearts.map(h => (
        <div key={h.id} className="absolute pointer-events-none z-[110] animate-bounce-up" style={{ left: h.x, top: h.y }}>
          <Heart size={28} style={{ color: h.color, fill: h.color }} className="opacity-90" />
        </div>
      ))}

      <div className="hidden md:block fixed pointer-events-none z-[200]" id="custom-cursor">
        <div className="relative">
          <Heart size={28} className="text-red-500 fill-red-400 animate-pulse-soft" />
          <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-spin-slow" />
        </div>
      </div>

      {step !== 'intro' && (
        <div className="fixed top-6 right-6 z-[300] animate-in fade-in zoom-in duration-700">
          <button
            onClick={toggleCustomSong}
            className={`group relative p-5 rounded-full shadow-2xl transition-all active:scale-90 border-4 border-white ${
              isCustomSongPlaying 
                ? 'bg-pink-500 text-white animate-pulse' 
                : 'bg-white text-pink-500 hover:scale-110'
            }`}
          >
            {isCustomSongPlaying ? <Music4 size={32} /> : <VolumeX size={32} />}
          </button>
        </div>
      )}

      {step === 'intro' && (
        <div className="z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
          <HeartCanvas />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
          <div className="z-20 text-center px-6">
            <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-romantic text-white mb-6 tracking-tighter drop-shadow-[0_0_30px_rgba(255,100,150,0.8)]">
              For Vanshika
            </h1>
            <p className="text-pink-300 mb-12 tracking-[0.7em] text-sm md:text-base font-black uppercase italic animate-pulse">A Surprise From Your Dino</p>
            <button 
              onMouseEnter={playHoverSound}
              onClick={(e) => { e.stopPropagation(); spawnHearts(e); setStep('choice'); }}
              className="group relative px-16 py-7 bg-white/90 hover:bg-white rounded-full text-red-700 font-black text-2xl shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 transition-all active:scale-95 flex items-center gap-4 mx-auto border-4 border-pink-100/50"
            >
              Let's Go <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500 w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {step === 'choice' && (
        <div className="z-10 text-center px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 max-w-6xl w-full">
          <div className="mb-12 space-y-4">
            <Heart className="w-16 h-16 text-red-500 fill-red-500 mx-auto animate-pulse" />
            <h2 className="text-6xl sm:text-8xl font-romantic text-red-900 italic tracking-tight">Pick a Rose</h2>
            <div className="h-1.5 w-48 bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-10 px-4">
            {[
              { color: RoseColor.RED, label: 'Red', iconColor: 'text-red-600' },
              { color: RoseColor.PINK, label: 'Pink', iconColor: 'text-pink-400' },
              { color: RoseColor.YELLOW, label: 'Yellow', iconColor: 'text-yellow-400' },
              { color: RoseColor.WHITE, label: 'White', iconColor: 'text-slate-400' },
              { color: RoseColor.BLUE, label: 'Blue', iconColor: 'text-blue-500' },
            ].map((r) => {
              const isSelected = selectingColor === r.color;
              return (
                <button
                  key={r.color}
                  onMouseEnter={playHoverSound}
                  onClick={(e) => { e.stopPropagation(); spawnHearts(e); handleChoice(r.color as RoseColor); }}
                  className={`group flex flex-col items-center gap-4 p-8 rounded-[4rem] bg-white/80 backdrop-blur-3xl border-4 transition-all duration-300 
                    ${isSelected 
                      ? 'scale-110 border-pink-400 ring-8 ring-pink-400/30 shadow-[0_0_50px_rgba(244,114,182,0.8)]' 
                      : 'border-white shadow-xl hover:shadow-[0_20px_40px_rgba(255,100,100,0.2)] hover:-translate-y-4 hover:ring-4 hover:ring-pink-100'
                    } active:scale-95`}
                >
                  <div className="relative">
                    <Flower2 className={`w-16 h-16 md:w-24 md:h-24 ${r.iconColor} group-hover:rotate-[25deg] transition-transform duration-700`} />
                  </div>
                  <span className={`font-romantic text-3xl transition-colors duration-300 ${isSelected ? 'text-pink-600' : 'text-red-950'}`}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 'blooming' && (
        <div className="z-10 flex flex-col items-center gap-12 px-6" onClick={handleBloomTouch}>
          <div className="relative group cursor-pointer scale-125">
            <div className="absolute inset-0 bg-red-400/10 blur-[100px] rounded-full animate-pulse transition-all"></div>
            <InteractiveRose isBloomed={isRoseBloomed} />
          </div>
          {!isRoseBloomed && (
            <h2 className="text-4xl sm:text-6xl font-romantic text-red-900 italic animate-pulse leading-none px-4 mt-10">
              {loadingText}
            </h2>
          )}
        </div>
      )}

      {step === 'reveal' && wish && (
        <div className="z-10 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 animate-in fade-in slide-in-from-bottom-20 duration-1000 pb-32 pt-10">
          <div className="w-full lg:w-1/2 max-w-lg mx-auto flex flex-col items-center gap-10">
             <div className="group relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(220,38,38,0.3)] border-[12px] border-white transition-all hover:scale-[1.02] duration-1000 bg-pink-100 flex items-center justify-center">
                <img 
                  src={wish.imageUrl} 
                  className="w-full h-full object-cover transform transition-transform duration-[15s] hover:scale-110" 
                  alt="Rose for Vanshika" 
                  onError={(e) => { 
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if(parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center gap-4 text-pink-400 font-romantic text-3xl p-10 text-center">
                          <p>File Not Found</p>
                          <p class="text-xl">Trying to load: <b>${wish.imageUrl}</b></p>
                          <p class="text-xs opacity-60">Verify your 'assets' folder has '${wish.imageUrl?.split('/').pop()}'</p>
                        </div>`;
                    }
                  }}
                />
             </div>
             
             <div className="w-full bg-white/80 backdrop-blur-3xl p-6 rounded-[2.5rem] border-2 border-pink-200 shadow-xl">
                <button 
                  onMouseEnter={playHoverSound}
                  onClick={toggleCustomSong}
                  className={`w-full flex items-center justify-center gap-4 py-8 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 text-3xl group ${
                    isCustomSongPlaying 
                      ? 'bg-pink-50 text-pink-600 border-2 border-pink-400' 
                      : 'bg-gradient-to-br from-red-600 via-rose-500 to-pink-500 text-white animate-pulse-soft'
                  }`}
                >
                  {isCustomSongPlaying ? (
                    <><Pause size={40} /><span>Stop Song</span></>
                  ) : (
                    <><Music4 size={40} className="animate-bounce" /><span>Play Our Song</span></>
                  )}
                </button>
             </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
             <div className="space-y-2">
               <div className="h-1.5 w-16 bg-red-600 rounded-full mx-auto lg:mx-0 mb-4"></div>
               <h3 className="text-red-950 italic text-5xl sm:text-6xl font-romantic leading-tight">My Sweetheart...</h3>
             </div>
             
             <div className="relative group py-4">
               <Quote className="absolute -top-6 -left-6 text-pink-200 w-16 h-16 opacity-30" />
               <p className="text-2xl sm:text-3xl md:text-4xl font-romantic text-red-950 leading-[1.6] italic px-4 lg:px-0">
                 {wish.message}
               </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-6 pt-6 justify-center lg:justify-start">
                <button 
                  onMouseEnter={playHoverSound}
                  onClick={(e) => { e.stopPropagation(); spawnHearts(e); setStep('choice'); }}
                  className="flex items-center justify-center gap-4 px-10 py-5 bg-white border-2 border-pink-100 text-red-600 rounded-full shadow-lg transition-all active:scale-90 text-xl font-black"
                >
                  <RotateCcw size={24} />
                  <span>Choose Another</span>
                </button>
             </div>
             
             <div className="pt-12 border-t border-pink-100/30 inline-block w-full opacity-60">
               <p className="font-montserrat text-gray-400 text-[9px] tracking-[0.4em] uppercase">Handcrafted for Vanshika with Eternal Love ✨</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
