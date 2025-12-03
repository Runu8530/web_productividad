export type EventColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';

export interface CalendarEvent {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  description: string;
  color: EventColor;
}

export type TimerMode = 'pomodoro' | 'stopwatch';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // for pomodoro (seconds remaining)
  timeElapsed: number; // for stopwatch (seconds elapsed)
  isActive: boolean;
}

export type AppView = 'dashboard' | 'flipclock';