import { createClient } from '@supabase/supabase-js';

// Provide placeholder values if credentials are missing to prevent the entire app from crashing.
// Note: Actual supabase requests will fail unless environment variables are properly set in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
