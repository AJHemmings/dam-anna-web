import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAuth -- Subscribes to Supabase auth state changes.
 * 
 * Returns the current user, session, loading state, and auth actions.
 * Loading is true until the initial session check completes, which
 * prevents a flash of the login page for already-authenticated users.
 * 
 * Usage:
 *   const { user, session, loading, signIn, signOut } = useAuth();
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    async function getInitialSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password.
   * Returns { data, error } -- caller handles error display.
   */
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Sign out the current user.
   * Returns { error } -- caller handles error display.
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  return { user, session, loading, signIn, signOut };
}