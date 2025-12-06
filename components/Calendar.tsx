import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventColor } from '../types';
import { Icons } from './ui/Icons';
import { getWeekDays, formatDateKey, isSameDay } from '../utils/timeUtils';

const COLORS: Record<EventColor, string> = {
  red: 'bg-red-900/40 border-red-700 text-red-200 hover:bg-red-900/60',
  blue: 'bg-blue-900/40 border-blue-700 text-blue-200 hover:bg-blue-900/60',
  green: 'bg-emerald-900/40 border-emerald-700 text-emerald-200 hover:bg-emerald-900/60',
  yellow: 'bg-yellow-900/40 border-yellow-700 text-yellow-200 hover:bg-yellow-900/60',
  purple: 'bg-purple-900/40 border-purple-700 text-purple-200 hover:bg-purple-900/60',
  gray: 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700',
};

const COLOR_DOTS: Record<EventColor, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  gray: 'bg-zinc-500',
};

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (date: Date) => void;
  onViewEvent: (event: CalendarEvent) => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onAddEvent,
  onViewEvent,
  isConnected,
  onConnect,
  onDisconnect,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    setWeekDays(getWeekDays(currentDate));
  }, [currentDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(e.start, date));
  };

  const today = new Date();

  const getEventColorStyle = (color?: string): string => {
    const validColors = Object.keys(COLORS) as EventColor[];
    if (color && validColors.includes(color as EventColor)) {
      return COLORS[color as EventColor];
    }
    return COLORS.blue; // Default fallback
  };

  const getEventDotStyle = (color?: string): string => {
    const validColors = Object.keys(COLOR_DOTS) as EventColor[];
    if (color && validColors.includes(color as EventColor)) {
      return COLOR_DOTS[color as EventColor];
    }
    return COLOR_DOTS.blue; // Default fallback
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface rounded-3xl p-6 border border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Icons.Calendar className="w-5 h-5 text-zinc-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            Weekly Plan
          </span>
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin text-white' : ''}`}
            title="Refresh Calendar"
          >
            <Icons.Refresh className="w-4 h-4" />
          </button>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-400/10 rounded-full border border-green-400/20">
                Connected
              </span>
              <button
                onClick={onDisconnect}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1"
            >
              <Icons.Add className="w-3 h-3" /> Connect Google
            </button>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Icons.Left className="w-5 h-5" />
            </button>
            <span className="text-sm font-mono text-zinc-500 min-w-[140px] text-center">
              {weekDays[0] && weekDays[6] ? (
                `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              ) : '...'}
            </span>
            <button onClick={handleNextWeek} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Icons.Right className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex-1 h-auto md:h-0 min-h-[300px] overflow-y-auto md:overflow-visible">
        {weekDays.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, today);

          return (
            <div key={i} className={`flex flex-row md:flex-col h-auto md:h-full rounded-2xl overflow-hidden transition-colors ${isToday ? 'bg-white/5 ring-1 ring-white/10' : 'bg-transparent'} border border-white/5 md:border-none mb-2 md:mb-0 min-h-[100px] md:min-h-0`}>
              <div
                className={`p-3 md:text-center border-r md:border-r-0 md:border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group flex md:block flex-col justify-center items-center min-w-[80px] md:min-w-0`}
                onClick={() => onAddEvent(day)}
              >
                <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wider">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-lg font-mono font-bold ${isToday ? 'text-white scale-110 inline-block' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {day.getDate()}
                </div>
                <div className="h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icons.Add className="w-3 h-3 text-zinc-500" />
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar md:block flex flex-col justify-start">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onViewEvent(event)}
                    className={`w-full text-left p-2 rounded-lg border text-xs font-medium transition-all duration-200 shadow-sm ${getEventColorStyle(event.color)} group`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getEventDotStyle(event.color)}`}></div>
                      <span className="truncate opacity-90">{event.title}</span>
                    </div>
                  </button>
                ))}

                {dayEvents.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAddEvent(day)}
                      className="w-full h-full flex items-center justify-center text-zinc-700 hover:text-zinc-500 py-4 md:py-0"
                    >
                      <Icons.Add className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div >
  );
};

export default Calendar;