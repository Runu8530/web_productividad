import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventColor } from '../types';
import { Icons } from './ui/Icons';
import { formatDateKey } from '../utils/timeUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  activeDate: Date | null;
  existingEvent: CalendarEvent | null;
}

const COLOR_OPTIONS: EventColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'gray'];

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
  const [color, setColor] = useState<EventColor>('blue');

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setColor(existingEvent.color);
    } else {
      setTitle('');
      setDescription('');
      setColor('blue');
    }
  }, [existingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDate && !existingEvent) return;

    const dateStr = existingEvent ? existingEvent.date : formatDateKey(activeDate!);
    
    onSave({
      id: existingEvent ? existingEvent.id : crypto.randomUUID(),
      date: dateStr,
      title: title || 'New Event',
      description,
      color,
    });
    onClose();
  };

  const handleDelete = () => {
      if(existingEvent) {
          onDelete(existingEvent.id);
          onClose();
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

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details here..."
                rows={4}
                className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none placeholder:text-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Color Tag</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c === 'gray' ? '#71717a' : c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                {existingEvent ? 'Update' : 'Create'}
              </button>
              {existingEvent && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-3 bg-red-900/20 text-red-400 font-medium rounded-xl hover:bg-red-900/40 transition-colors"
                  >
                      Delete
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