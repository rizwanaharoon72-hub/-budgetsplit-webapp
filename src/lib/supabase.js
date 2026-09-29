import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[BudgetSplit] Missing Supabase environment variables.\n' +
    'Copy .env.example to .env and fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Supabase client already persists the session in localStorage automatically
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
