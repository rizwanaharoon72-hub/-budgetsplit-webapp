import { supabase } from '../lib/supabase';

/**
 * authService — wraps all Supabase Auth calls.
 * Pages/hooks import from this service, never calling supabase.auth directly.
 */
export const authService = {
  /**
   * Sign up a new user.
   * The `handle_new_user` DB trigger automatically inserts a profiles row.
   */
  async signUp(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // stored in auth.users.raw_user_meta_data, picked up by trigger
      },
    });

    if (error) {
      // Translate Supabase errors into friendly UI messages
      if (error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already in use') ||
          error.message?.toLowerCase().includes('unique') ||
          error.status === 422) {
        throw new Error('This email address is already registered. Please sign in instead.');
      }
      console.error('[authService.signUp]', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }

    // If signup succeeded but session is null (e.g., if confirmation is not required or auto-login is needed),
    // try signing in directly with password
    if (!data.session && data.user) {
      try {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.data?.session) {
          return signInRes.data;
        }
      } catch (e) {
        // If email confirmation is required by Supabase project settings
        console.warn('Auto sign-in after signup pending confirmation:', e);
      }
    }

    return data;
  },

  /**
   * Sign in an existing user with email + password.
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Email not confirmed. Please check your email inbox to confirm your account, or disable "Confirm email" in Supabase Auth settings.');
      }
      if (error.message?.toLowerCase().includes('invalid login') ||
          error.message?.toLowerCase().includes('invalid credentials') ||
          error.status === 400) {
        throw new Error('Incorrect email or password. Please check your credentials.');
      }
      console.error('[authService.signIn]', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }

    return data;
  },

  /**
   * Sign in / Sign up using Google OAuth.
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) {
      console.error('[authService.signInWithGoogle]', error);
      throw new Error(error.message || 'Google sign-in failed. Please try again.');
    }

    return data;
  },

  /**
   * Sign out the current user and clear the Supabase session.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[authService.signOut]', error);
      // Don't throw — best effort; local state will still be cleared
    }
  },

  /**
   * Restore an existing session from Supabase's persisted storage.
   * Returns { session, user } or null session if not authenticated.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[authService.getSession]', error);
      return null;
    }
    return data.session;
  },

  /**
   * Subscribe to auth state changes (login, logout, token refresh, tab sync).
   * Returns the unsubscribe function to call on cleanup.
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    return () => subscription.unsubscribe();
  },
};
