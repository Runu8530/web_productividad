import React, { useState } from 'react';
import { Icons } from './ui/Icons';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review project requirements', completed: true },
    { id: '2', text: 'Draft initial layout', completed: false },
  ]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: inputValue, completed: false }]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="h-full w-full bg-surface rounded-3xl p-6 border border-white/5 flex flex-col shadow-xl relative overflow-hidden">
       {/* Top accent */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 to-zinc-800"></div>

      <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2 mb-6">
        <Icons.Check className="w-5 h-5 text-zinc-400" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
          To-Do List
        </span>
      </h2>
      
      <form onSubmit={addTodo} className="mb-4 relative group">
        <input
             type="text"
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             placeholder="Add a new task..."
             className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-4 pr-12 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
        />
        <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-700 hover:bg-white rounded-lg text-white hover:text-black transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
            <Icons.Add className="w-4 h-4" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {todos.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 opacity-50 min-h-[100px]">
                <Icons.Check className="w-8 h-8 mb-2" />
                <p className="text-sm font-mono uppercase tracking-widest">No tasks yet</p>
             </div>
        )}
        {todos.map(todo => (
            <div key={todo.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all hover:bg-white/[0.07]">
                <button onClick={() => toggleTodo(todo.id)} className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${todo.completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'border-zinc-600 hover:border-zinc-500'}`}>
                    {todo.completed && <Icons.Check className="w-3 h-3" />}
                </button>
                <span className={`flex-1 text-sm transition-colors ${todo.completed ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-zinc-300'}`}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-all">
                    <Icons.Trash className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;