/**
 * AnalyticsPage -- Placeholder for Vercel Analytics integration.
 * 
 * Will show detailed traffic data, page views, referrers, and performance
 * metrics once the Vercel Analytics API is integrated.
 */

// CUSTOMIZATION: Card styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Detailed site traffic and performance metrics.
      </p>

      <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-8 text-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-zinc-600 mx-auto mb-4">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <h2 className="text-lg font-semibold text-zinc-400 mb-2">Vercel Analytics</h2>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          This page will display detailed analytics from Vercel including page views,
          unique visitors, top pages, referrers, and performance metrics.
          Integration will be added in a future session.
        </p>
      </div>
    </div>
  );
}