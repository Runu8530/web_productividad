import { createClient } from '@supabase/supabase-js';

// Database Types
export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
    color: string;
    created_at: string;
}

export interface TimerSession {
    id: string;
    duration: number;
    completed: boolean;
    started_at: string;
    completed_at: string | null;
}

// Supabase Database Schema
export type Database = {
    public: {
        Tables: {
            todos: {
                Row: {
                    id: string;
                    text: string;
                    completed: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    text: string;
                    completed?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    text?: string;
                    completed?: boolean;
                    created_at?: string;
                };
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    start_date: string;
                    end_date: string | null;
                    description: string | null;
                    color: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    start_date: string;
                    end_date?: string | null;
                    description?: string | null;
                    color: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    start_date?: string;
                    end_date?: string | null;
                    description?: string | null;
                    color?: string;
                    created_at?: string;
                };
            };
            timer_sessions: {
                Row: {
                    id: string;
                    duration: number;
                    completed: boolean;
                    started_at: string;
                    completed_at: string | null;
                };
                Insert: {
                    id?: string;
                    duration: number;
                    completed?: boolean;
                    started_at?: string;
                    completed_at?: string | null;
                };
                Update: {
                    id?: string;
                    duration?: number;
                    completed?: boolean;
                    started_at?: string;
                    completed_at?: string | null;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
};


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
