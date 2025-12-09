import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { Icons } from './ui/Icons';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  activeDate: Date | null;
  existingEvent: CalendarEvent | null;
}

const COLOR_OPTIONS = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#71717a'];
const COLOR_NAMES = ['red', 'blue', 'green', 'yellow', 'purple', 'gray'];

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  activeDate,
  existingEvent
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>('#3b82f6');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description || '');
      setColor(existingEvent.color || '#3b82f6');

      // Extract time from existing event
      const start = new Date(existingEvent.start);
      const end = existingEvent.end ? new Date(existingEvent.end) : new Date(start.getTime() + 60 * 60 * 1000);

      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setTitle('');
      setDescription('');
      setColor('#3b82f6');

      // Default times
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // Round to nearest 15
      const startStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      const endStr = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      setStartTime(startStr);
      setEndTime(endStr);
    }
  }, [existingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDate && !existingEvent) return;

    // Base date (year, month, day)
    const baseDate = existingEvent ? new Date(existingEvent.start) : activeDate!;

    // Create new start date with time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDate = new Date(baseDate);
    startDate.setHours(startHour, startMinute, 0, 0);

    // Create new end date with time
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const endDate = new Date(baseDate);
    endDate.setHours(endHour, endMinute, 0, 0);

    // If end is before start, assume next day? Or just keep same day? 
    // For simplicity, let's just keep same day, user can correct if needed.
    // Ideally we might want end date to be separate, but request was just "time selection".

    try {
      setIsSubmitting(true);
      await onSave({
        id: existingEvent ? existingEvent.id : crypto.randomUUID(),
        start: startDate,
        end: endDate,
        title: title || 'New Event',
        description,
        color,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save event", error);
      // Optional: show error message in UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (existingEvent) {
      try {
        setIsSubmitting(true);
        await onDelete(existingEvent.id);
        onClose();
      } catch (error) {
        console.error("Failed to delete event", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl transform transition-all scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {existingEvent ? 'Event Details' : `New Event`}
            </h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <Icons.Close className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting, Workout, etc."
                className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all placeholder:text-zinc-700"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all placeholder:text-zinc-700 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all placeholder:text-zinc-700 [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details here..."
                rows={3}
                className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none placeholder:text-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Color Tag</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c, index) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                    style={{ backgroundColor: c }}
                    title={COLOR_NAMES[index]}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (existingEvent ? 'Update' : 'Create')}
              </button>
              {existingEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-3 bg-red-900/20 text-red-400 font-medium rounded-xl hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : 'Delete'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;