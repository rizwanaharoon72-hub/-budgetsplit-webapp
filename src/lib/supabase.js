import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nzurolarudfnrefdkgwo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8A7EHaXoYnJZiD-5KQLJgw_RA2g6IHX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Supabase client already persists the session in localStorage automatically
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
