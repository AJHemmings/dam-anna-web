import { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

/**
 * AuthContext -- Provides auth state to all admin components.
 * 
 * Wrap admin routes with <AuthProvider> so any child component
 * can call useAuthContext() to access user, session, signIn, signOut.
 * 
 * This avoids prop drilling auth state through the admin layout.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext -- Shortcut to consume the AuthContext.
 * 
 * Throws an error if used outside of <AuthProvider> to catch
 * accidental usage in public site components.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}