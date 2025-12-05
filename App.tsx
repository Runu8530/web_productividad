import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import FlipClock from './components/FlipClock';
import EventModal from './components/EventModal';
import { Icons } from './components/ui/Icons';
import { AppView, CalendarEvent } from './types';
import { fetchGoogleCalendarEvents } from './utils/googleCalendar';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadGoogleEvents = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
      const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

      if (apiKey && calendarId) {
        const googleEvents = await fetchGoogleCalendarEvents(apiKey, calendarId);
        if (googleEvents.length > 0) {
          setEvents(prev => {
            // Avoid duplicates based on ID
            const existingIds = new Set(prev.map(e => e.id));
            const newEvents = googleEvents.filter(e => !existingIds.has(e.id));
            return [...prev, ...newEvents];
          });
        }
      }
    };

    loadGoogleEvents();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleAddEventClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleViewEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (selectedEvent) {
      // Update
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      // Create
      setEvents([...events, event]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <>
      {view === 'flipclock' && <FlipClock onExit={() => setView('dashboard')} />}

      <div className={`min-h-screen bg-background p-4 sm:p-6 lg:p-8 flex flex-col transition-opacity duration-500 ${view === 'flipclock' ? 'opacity-0 pointer-events-none fixed' : 'opacity-100'}`}>

        {/* Header / Nav */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <div className="w-6 h-6 bg-black rounded-md"></div>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">OBSIDIAN</h1>
          </div>

          <button
            onClick={() => setView('flipclock')}
            className="group flex items-center gap-2 bg-surfaceHighlight border border-white/5 hover:border-white/20 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-full transition-all duration-300 shadow-lg"
          >
            <Icons.Clock className="w-4 h-4 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium">Zen Mode</span>
          </button>
        </header>

        {/* Main Layout - Flex Column */}
        {/* Use md breakpoint for fixed height dashboard layout on tablets/desktop */}
        <div className="flex-1 flex flex-col gap-6 md:h-[calc(100vh-8rem)]">

          {/* Top Section: Calendar (Takes about 45% of height on desktop) */}
          <div className="flex-[4] min-h-[350px]">
            <Calendar
              events={events}
              onAddEvent={handleAddEventClick}
              onViewEvent={handleViewEventClick}
            />
          </div>

          {/* Bottom Section: Split Grid (Takes about 55% of height on desktop) */}
          {/* grid-cols-1 by default (mobile), md:grid-cols-2 for tablet+ */}
          <div className="flex-[5] grid grid-cols-2 gap-6 min-h-[400px]">
            {/* Left: Timer */}
            <div className="h-full">
              <Timer />
            </div>

            {/* Right: Todo List */}
            <div className="h-full">
              <TodoList />
            </div>
          </div>

        </div>

        {/* Modal */}
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          activeDate={selectedDate}
          existingEvent={selectedEvent}
        />
      </div>
    </>
  );
};

export default App;