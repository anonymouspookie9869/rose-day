
import React from 'react';
import { RoseWish } from '../types';
import { Heart, Volume2, Share2, Download } from 'lucide-react';

interface RoseCardProps {
  wish: RoseWish;
  onPlayAudio: () => void;
}

export const RoseCard: React.FC<RoseCardProps> = ({ wish, onPlayAudio }) => {
  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100 transform transition-all hover:scale-[1.01]">
      <div className="relative h-96">
        {wish.imageUrl ? (
          <img src={wish.imageUrl} alt="AI Generated Rose" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-red-50 flex items-center justify-center">
            <Heart className="w-16 h-16 text-pink-300 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-white text-sm font-medium tracking-widest uppercase mb-1">Happy Rose Day</p>
          <h2 className="text-white text-3xl font-romantic leading-tight">To {wish.recipient}</h2>
        </div>
      </div>
      
      <div className="p-8 bg-white text-center">
        <p className="text-gray-700 italic text-lg leading-relaxed font-elegant mb-8">
          "{wish.message}"
        </p>

        <div className="flex justify-center gap-4">
          {wish.audioData && (
            <button 
              onClick={onPlayAudio}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
            >
              <Volume2 size={20} />
              <span className="font-medium">Hear Wish</span>
            </button>
          )}
          <button 
            onClick={() => window.print()}
            className="p-3 border border-pink-200 text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
            title="Download/Print"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => navigator.share?.({ title: 'Rose Day Wish', text: wish.message })}
            className="p-3 border border-pink-200 text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
            title="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
