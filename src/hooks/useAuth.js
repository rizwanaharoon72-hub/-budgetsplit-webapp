import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

/**
 * useAuth — manages Supabase session state.
 * Restores session on mount, subscribes to auth state changes,
 * and exposes login/signup/logout actions.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until getSession() resolves

  useEffect(() => {
    let mounted = true;

    // 1. Restore any existing persisted session
    authService.getSession().then((session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // 2. Subscribe to real-time auth events (login, logout, token refresh, tab sync)
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      // Stop showing the splash loader after the first event resolves
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user via Supabase Auth.
   * The DB trigger creates the profiles row automatically.
   */
  const signup = async (name, email, password) => {
    if (!name?.trim() || !email?.trim() || !password) {
      throw new Error('Please fill in all required fields.');
    }
    const res = await authService.signUp(name.trim(), email.trim(), password);
    return res;
  };

  /**
   * Sign in an existing user via Supabase Auth.
   */
  const login = async (email, password) => {
    if (!email?.trim() || !password) {
      throw new Error('Please fill in both email and password.');
    }
    const { user: signedInUser } = await authService.signIn(email.trim(), password);
    return signedInUser;
  };

  /**
   * Sign in using Google OAuth
   */
  const loginWithGoogle = async () => {
    return await authService.signInWithGoogle();
  };

  /**
   * Sign out — clears Supabase session and resets local state.
   */
  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return {
    user,
    // Treat a confirmed Supabase user as authenticated
    isAuthenticated: !!user?.id,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  };
}
