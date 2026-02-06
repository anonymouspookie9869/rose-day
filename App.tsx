
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RoseColor, RoseWish } from './types';
import { getRoseDayWish, getRoseImagePath } from './services/geminiService';
import { PetalOverlay } from './components/PetalOverlay';
import { InteractiveRose } from './components/InteractiveRose';
import HeartCanvas from './components/HeartCanvas';
import { Heart, Sparkles, Flower2, ArrowRight, RotateCcw, Star, Play, Music4, Quote } from 'lucide-react';

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

const CUSTOM_SONG_URL = 'audio.mp3'; 
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

  useEffect(() => {
    customAudioRef.current = new Audio(CUSTOM_SONG_URL);
    customAudioRef.current.loop = true;
    return () => {
      customAudioRef.current?.pause();
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
    } catch (e) {
      console.warn("Audio Context could not start", e);
    }
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
    
    // Brief delay to allow the selection animation to play
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
    // Increased from 1800ms to 4500ms to let the animation and text breathe
    setTimeout(() => setStep('reveal'), 4500);
  };

  const stopAllAudio = useCallback(() => {
    customAudioRef.current?.pause();
    setIsCustomSongPlaying(false);
  }, []);

  const toggleCustomSong = (e: any) => {
    spawnHearts(e);
    if (!customAudioRef.current) return;
    if (isCustomSongPlaying) {
      customAudioRef.current.pause();
      setIsCustomSongPlaying(false);
    } else {
      customAudioRef.current.play().catch(e => console.error("Playback failed", e));
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
            <h2 className="text-6xl sm:text-8xl font-romantic text-red-900 italic tracking-tight">Choose Any</h2>
            <div className="h-1.5 w-48 bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-10 px-4">
            {[
              { color: RoseColor.RED, label: 'Red', desc: 'True Love', iconColor: 'text-red-600' },
              { color: RoseColor.PINK, label: 'Pink', desc: 'Grace', iconColor: 'text-pink-400' },
              { color: RoseColor.YELLOW, label: 'Yellow', desc: 'Friendship', iconColor: 'text-yellow-400' },
              { color: RoseColor.WHITE, label: 'White', desc: 'Purity', iconColor: 'text-slate-400' },
              { color: RoseColor.BLUE, label: 'Blue', desc: 'Mystery', iconColor: 'text-blue-500' },
            ].map((r) => {
              const isSelected = selectingColor === r.color;
              return (
                <button
                  key={r.color}
                  onMouseEnter={playHoverSound}
                  onClick={(e) => { e.stopPropagation(); spawnHearts(e); handleChoice(r.color); }}
                  className={`group flex flex-col items-center gap-4 p-8 rounded-[4rem] bg-white/80 backdrop-blur-3xl border-4 transition-all duration-300 
                    ${isSelected 
                      ? 'scale-110 border-pink-400 ring-8 ring-pink-400/30 shadow-[0_0_50px_rgba(244,114,182,0.8)]' 
                      : 'border-white shadow-xl hover:shadow-[0_20px_40px_rgba(255,100,100,0.2)] hover:-translate-y-4 hover:ring-4 hover:ring-pink-100'
                    } active:scale-95`}
                >
                  <div className="relative">
                    <Flower2 className={`w-16 h-16 md:w-24 md:h-24 ${r.iconColor} group-hover:rotate-[25deg] transition-transform duration-700`} />
                    <Heart className={`absolute -top-4 -right-4 w-8 h-8 text-red-500 fill-red-500 transition-all duration-500 ${isSelected ? 'opacity-100 scale-125' : 'opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'} animate-bounce`} />
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
          <div className="text-center space-y-6">
            {!isRoseBloomed && (
              <h2 className="text-4xl sm:text-6xl font-romantic text-red-900 italic animate-pulse leading-none px-4 mt-10">
                {loadingText}
              </h2>
            )}
          </div>
        </div>
      )}

      {step === 'reveal' && wish && (
        <div className="z-10 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 animate-in fade-in slide-in-from-bottom-20 duration-1000 pb-32 pt-10">
          <div className="w-full lg:w-1/2 max-w-xl mx-auto space-y-12">
             <div className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(220,38,38,0.3)] border-[15px] border-white transition-all hover:scale-[1.02] duration-1000">
                <img 
                  src={wish.imageUrl} 
                  className="w-full h-full object-cover transform transition-transform duration-[15s] hover:scale-110" 
                  alt="Vanshika's Special Rose" 
                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             </div>
             
             <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] border-2 border-pink-100 shadow-2xl group relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Heart size={24} className="text-pink-500 fill-pink-500" />
                    <p className="text-pink-900 font-romantic text-4xl text-center">For Vanshika</p>
                    <Heart size={24} className="text-pink-500 fill-pink-500" />
                  </div>
                  
                  <button 
                    onMouseEnter={playHoverSound}
                    onClick={toggleCustomSong}
                    className={`w-full flex items-center justify-center gap-6 py-6 rounded-full font-black transition-all shadow-xl active:scale-95 text-2xl ${
                      isCustomSongPlaying 
                        ? 'bg-white text-pink-600 border-2 border-pink-200' 
                        : 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:brightness-110'
                    }`}
                  >
                    {isCustomSongPlaying ? (
                      <>
                        <div className="flex gap-2 items-end h-6">
                          {[0.3, 0.6, 1, 0.4].map((d, i) => (
                            <div key={i} className="w-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDuration: `${d}s` }}></div>
                          ))}
                        </div>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={30} className="fill-current" />
                        <span>I have made a song for you</span>
                      </>
                    )}
                  </button>
                </div>
             </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-12 text-center lg:text-left">
             <div className="space-y-4">
               <div className="h-2 w-24 bg-red-600 rounded-full mx-auto lg:mx-0"></div>
               <h3 className="text-red-950 italic text-5xl sm:text-6xl font-romantic leading-tight">My Sweetheart...</h3>
             </div>
             
             <div className="relative group">
               <Quote className="absolute -top-10 -left-10 text-pink-200 w-20 h-20 opacity-20" />
               <p className="text-3xl sm:text-4xl md:text-5xl font-romantic text-red-950 leading-[1.4] italic drop-shadow-sm">
                 {wish.message}
               </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-6 pt-10 justify-center lg:justify-start">
                <button 
                  onMouseEnter={playHoverSound}
                  onClick={(e) => { e.stopPropagation(); spawnHearts(e); stopAllAudio(); setStep('choice'); }}
                  className="flex items-center justify-center gap-6 px-12 py-6 bg-white/90 border-4 border-white text-red-600 rounded-full hover:bg-white shadow-xl transition-all active:scale-90 group"
                >
                  <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-700" />
                  <span className="text-2xl font-black">Choose Another</span>
                </button>
             </div>
             
             <div className="pt-10 border-t border-pink-100/50 inline-block w-full">
               <p className="font-montserrat text-gray-400 text-[10px] tracking-[0.5em] uppercase">Handcrafted with Love for Vanshika ✨</p>
               <p className="text-pink-300 text-[9px] mt-2 font-montserrat tracking-widest italic opacity-60">By Your Mad Head 😌</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
