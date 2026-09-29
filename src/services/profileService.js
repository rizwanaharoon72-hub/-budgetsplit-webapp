import { supabase } from '../lib/supabase';

/**
 * profileService — CRUD for the `profiles` table.
 * All queries are automatically scoped to auth.uid() via RLS.
 */
export const profileService = {
  /**
   * Fetch the currently authenticated user's profile row.
   * Returns the profile object or null if not found.
   */
  async getProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (error) {
      // PGRST116 = "no rows" — new user whose trigger hasn't fired or race condition
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[profileService.getProfile]', error);
      throw new Error("Couldn't load your profile. Please refresh and try again.");
    }

    return data;
  },

  /**
   * Update name and/or current_monthly_income for the logged-in user.
   * The updated_at trigger handles the timestamp automatically.
   */
  async updateProfile({ name, current_monthly_income }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (current_monthly_income !== undefined) {
      updates.current_monthly_income = Number(current_monthly_income);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[profileService.updateProfile]', error);
      throw new Error("Couldn't save your profile. Please try again.");
    }

    return data;
  },

  /**
   * Upsert — used as fallback if the trigger-created row is missing.
   */
  async upsertProfile({ id, name, email, current_monthly_income = 0 }) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id, name, email, current_monthly_income }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[profileService.upsertProfile]', error);
      throw new Error("Couldn't create your profile. Please try again.");
    }

    return data;
  },
};
