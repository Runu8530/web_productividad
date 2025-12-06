import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './ui/Icons';
import { TimerMode, TimerState } from '../types';
import { formatTime } from '../utils/timeUtils';

const POMODORO_TIME = 25 * 60; // 25 minutes

const Timer: React.FC = () => {
  const [state, setState] = useState<TimerState>({
    mode: 'pomodoro',
    timeLeft: POMODORO_TIME,
    timeElapsed: 0,
    isActive: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isActive) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.mode === 'pomodoro') {
            if (prev.timeLeft <= 0) {
              // Timer finished
              if (timerRef.current) clearInterval(timerRef.current);
              return { ...prev, isActive: false, timeLeft: 0 };
            }
            return { ...prev, timeLeft: prev.timeLeft - 1 };
          } else {
            // Stopwatch
            return { ...prev, timeElapsed: prev.timeElapsed + 1 };
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isActive, state.mode]);

  const toggleTimer = () => {
    setState((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      timeLeft: POMODORO_TIME,
      timeElapsed: 0,
    }));
  };

  const switchMode = (mode: TimerMode) => {
    setState({
      mode,
      timeLeft: POMODORO_TIME,
      timeElapsed: 0,
      isActive: false,
    });
  };

  const displayTime = state.mode === 'pomodoro' ? state.timeLeft : state.timeElapsed;
  const progress = state.mode === 'pomodoro'
    ? ((POMODORO_TIME - state.timeLeft) / POMODORO_TIME) * 100
    : 100;

  return (
    <div className="h-full w-full bg-surface rounded-3xl p-6 border border-white/5 flex flex-col relative overflow-hidden shadow-xl">
      {/* Background accent */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${state.isActive ? 'from-blue-500 to-purple-600' : 'from-zinc-700 to-zinc-800'}`}></div>

      <div className="flex justify-center space-x-2 mb-8 bg-black/20 p-1 rounded-xl self-center">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${state.mode === 'pomodoro'
              ? 'bg-zinc-700 text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode('stopwatch')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${state.mode === 'stopwatch'
              ? 'bg-zinc-700 text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Stopwatch
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          {/* Decorative ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/5 blur-sm transform scale-110"></div>

          <div className="text-5xl md:text-7xl font-mono font-bold tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {formatTime(displayTime)}
          </div>
        </div>

        {state.mode === 'pomodoro' && (
          <div className="w-full max-w-[200px] h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${100 - progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center gap-6">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${state.isActive
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
          >
            {state.isActive ? <Icons.Pause size={28} fill="currentColor" /> : <Icons.Play size={28} fill="currentColor" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-white/5"
          >
            <Icons.Reset size={20} />
          </button>
        </div>
      </div>

      <div className="mt-auto text-center">
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
          {state.isActive ? 'Session Active' : 'Ready to Focus'}
        </p>
      </div>
    </div>
  );
};

export default Timer;