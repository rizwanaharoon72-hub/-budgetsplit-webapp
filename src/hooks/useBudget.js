import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { calculateBudget } from '../utils/budgetCalculator';

/**
 * useBudget — manages the user profile (name + income) from Supabase.
 * Exposes the 50/30/20 limits computed from current_monthly_income.
 */
export function useBudget(userId) {
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      // Not authenticated yet — reset and stop loading
      setProfileState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfileState(data);
    } catch (err) {
      console.error('[useBudget] loadProfile error:', err);
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Save name + income during Onboarding (or update either field later).
   * Maps the frontend field `monthlyIncome` to DB column `current_monthly_income`.
   */
  const setProfile = async ({ name, monthlyIncome }) => {
    try {
      setError(null);
      const updated = await profileService.updateProfile({
        name,
        current_monthly_income: monthlyIncome,
      });
      setProfileState(updated);
      return updated;
    } catch (err) {
      console.error('[useBudget] setProfile error:', err);
      throw err;
    }
  };

  /**
   * Update only the income field (used by EditIncome page).
   */
  const updateIncome = async (newIncome) => {
    try {
      setError(null);
      const updated = await profileService.updateProfile({
        current_monthly_income: newIncome,
      });
      setProfileState(updated);
      return updated;
    } catch (err) {
      console.error('[useBudget] updateIncome error:', err);
      throw err;
    }
  };

  // The DB column is `current_monthly_income`; adapt for the rest of the frontend
  const monthlyIncome = Number(profile?.current_monthly_income) || 0;
  const limits = calculateBudget(monthlyIncome);

  // Expose profile in the shape the existing pages expect (with a `name` field)
  const adaptedProfile = profile
    ? { ...profile, name: profile.name, monthlyIncome }
    : null;

  return {
    profile: adaptedProfile,
    monthlyIncome,
    limits,
    hasIncomeConfigured: monthlyIncome > 0,
    loading,
    error,
    setProfile,
    updateIncome,
    refreshBudget: loadProfile,
  };
}
