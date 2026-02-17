import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

/**
 * LoginPage -- Admin login form.
 * 
 * Simple email/password form that authenticates via Supabase Auth.
 * On success, redirects to /admin. On failure, shows error message.
 * 
 * Responsive: centered card layout works on mobile and desktop.
 * Session uses sessionStorage so closing the browser requires re-login.
 */

// CUSTOMIZATION: Login card styling
const CARD_MAX_WIDTH = 'max-w-md';
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';

// CUSTOMIZATION: Button styling
const BUTTON_BG = 'bg-white';
const BUTTON_TEXT = 'text-zinc-900';
const BUTTON_HOVER = 'hover:bg-zinc-200';
const BUTTON_DISABLED = 'disabled:opacity-50 disabled:cursor-not-allowed';

export default function LoginPage() {
  const { signIn } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Success -- navigate to dashboard
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <div className={`w-full ${CARD_MAX_WIDTH} ${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-8`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Dam Anna Admin</h1>
          <p className="text-zinc-400 text-sm">Sign in to manage your site</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 ${BUTTON_BG} ${BUTTON_TEXT} ${BUTTON_HOVER} ${BUTTON_DISABLED} font-medium rounded transition-colors`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}