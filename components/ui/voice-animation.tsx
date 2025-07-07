'use client';

import { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceAnimationProps {
  isListening: boolean;
  volume?: number; // 0-1 scale for volume visualization
  onStop?: () => void;
}

export function VoiceAnimation({ isListening, volume = 0.5, onStop }: VoiceAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isListening) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isListening]);

  if (!isListening) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative">
        {/* Pulsating circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="absolute w-32 h-32 bg-red-500 rounded-full voice-pulse"
            style={{
              transform: `scale(${1 + volume * 0.5})`
            }}
          />
          <div 
            className="absolute w-24 h-24 bg-red-400 rounded-full voice-pulse"
            style={{
              animationDelay: '0.3s',
              transform: `scale(${1 + volume * 0.3})`
            }}
          />
          <div 
            className="absolute w-16 h-16 bg-red-300 rounded-full voice-pulse"
            style={{
              animationDelay: '0.6s',
              transform: `scale(${1 + volume * 0.2})`
            }}
          />
        </div>

        {/* Microphone icon */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="bg-white rounded-full p-6 shadow-lg">
            <Mic className="w-8 h-8 text-red-500 voice-bounce" />
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-colors"
          title="Stop listening"
          aria-label="Stop voice recording"
        >
          <MicOff className="w-6 h-6" />
        </button>

        {/* Status text */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-lg font-semibold">Listening...</p>
          <p className="text-sm opacity-80">Click the button below to stop</p>
        </div>
      </div>
    </div>
  );
} 