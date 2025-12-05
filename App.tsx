import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import FlipClock from './components/FlipClock';
import EventModal from './components/EventModal';
import { Icons } from './components/ui/Icons';
import { AppView, CalendarEvent } from './types';
import { fetchGoogleCalendarEvents } from './utils/googleCalendar';
import { supabase, type Database } from './utils/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      // Fetch events from Supabase
      const { data: supabaseEvents, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching Supabase events:', error);
      }

      // Fetch Google Calendar events
      const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
      const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

      let googleEvents: CalendarEvent[] = [];
      if (apiKey && calendarId) {
        googleEvents = await fetchGoogleCalendarEvents(apiKey, calendarId);
      }

      // Merge events: Supabase events + Google Calendar events
      const allEvents: CalendarEvent[] = [
        ...(supabaseEvents || []).map(e => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start_date),
          end: e.end_date ? new Date(e.end_date) : undefined,
          description: e.description || undefined,
          color: e.color,
        })),
        ...googleEvents,
      ];

      setEvents(allEvents);
    };

    loadEvents();

    // Subscribe to real-time changes for events
    const channel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleSaveEvent = async (event: CalendarEvent) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updateData = {
          title: event.title,
          start_date: event.start.toISOString(),
          end_date: event.end ? event.end.toISOString() : null,
          description: event.description || null,
          color: event.color || '#3b82f6',
        };

        const { error } = await supabase
          .from('events')
          // @ts-ignore - Supabase type inference issue
          .update(updateData)
          .eq('id', event.id);

        if (error) throw error;
      } else {
        // Create new event
        const insertData = {
          id: event.id,
          title: event.title,
          start_date: event.start.toISOString(),
          end_date: event.end ? event.end.toISOString() : null,
          description: event.description || null,
          color: event.color || '#3b82f6',
        };

        const { error } = await supabase
          .from('events')
          // @ts-ignore - Supabase type inference issue
          .insert(insertData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
    }
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