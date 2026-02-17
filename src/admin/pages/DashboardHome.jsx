/**
 * DashboardHome -- Landing page after admin login.
 * 
 * Welcome screen with quick overview. Will eventually show
 * summary stats (upcoming gigs count, gallery count, etc.).
 * For now, a simple welcome message.
 */

// CUSTOMIZATION: Welcome card styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6`}>
        <h2 className="text-lg font-semibold text-white mb-2">Welcome back</h2>
        <p className="text-zinc-400">
          Use the sidebar to manage your gigs, gallery, videos, and site content.
          CRUD pages are coming in Session 5.
        </p>
      </div>
    </div>
  );
}