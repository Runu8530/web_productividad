import React, { useState, useEffect } from 'react';
import { Icons } from './ui/Icons';

interface FlipClockProps {
  onExit: () => void;
}

const FlipCard = ({ value, label }: { value: string | number; label?: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-[#1a1a1a] rounded-xl w-32 h-40 sm:w-48 sm:h-64 md:w-64 md:h-80 flex items-center justify-center overflow-hidden shadow-2xl border border-white/5">
        {/* Top half shine */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none"></div>
        
        {/* Horizontal Line */}
        <div className="absolute w-full h-[2px] bg-[#000] z-20"></div>
        
        {/* Number */}
        <span className="font-mono text-8xl sm:text-9xl md:text-[12rem] font-bold text-[#e4e4e7] z-0 leading-none tracking-tighter">
          {value}
        </span>
      </div>
      {label && <span className="mt-4 text-zinc-500 font-mono text-xl tracking-widest uppercase">{label}</span>}
    </div>
  );
};

const FlipClock: React.FC<FlipClockProps> = ({ onExit }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  let hours = time.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  // const secondsStr = time.getSeconds().toString().padStart(2, '0'); // Optional: Add seconds

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <button 
        onClick={onExit}
        className="absolute top-6 right-6 p-3 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
      >
        <Icons.Minimize className="w-8 h-8" />
      </button>

      <div className="flex items-end gap-4 sm:gap-8">
        <FlipCard value={hoursStr} label="Hours" />
        <div className="h-40 sm:h-64 md:h-80 flex items-center pb-8 sm:pb-0">
          <div className="flex flex-col gap-4 sm:gap-8">
             <div className="w-3 h-3 sm:w-4 sm:h-4 bg-zinc-700 rounded-full animate-pulse"></div>
             <div className="w-3 h-3 sm:w-4 sm:h-4 bg-zinc-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <FlipCard value={minutesStr} label="Minutes" />
        
        <div className="h-40 sm:h-64 md:h-80 flex items-end ml-4 sm:ml-8 pb-4">
             <span className="text-4xl sm:text-6xl font-black text-zinc-600 font-mono">{ampm}</span>
        </div>
      </div>
    </div>
  );
};

export default FlipClock;