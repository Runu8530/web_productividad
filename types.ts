export type EventColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  color?: string;
}


export type TimerMode = 'pomodoro' | 'stopwatch';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // for pomodoro (seconds remaining)
  timeElapsed: number; // for stopwatch (seconds elapsed)
  isActive: boolean;
}

export type AppView = 'dashboard' | 'flipclock';