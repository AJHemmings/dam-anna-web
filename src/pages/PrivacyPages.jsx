import { useEffect } from 'react';

/**
 * PrivacyPage
 *
 * UK GDPR-compliant privacy notice for the Dam Anna website.
 * Covers: photo submissions, contact form, and future mailing list.
 * Data controller: Adam Hemmings (damannaband@gmail.com)
 *
 * RESPONSIVE STRATEGY:
 * Single column prose layout. Max width constrained for readability.
 * No isMobile prop needed.
 *
 * CUSTOMIZATION:
 * - CONTROLLER_EMAIL: contact email for data requests
 * - PAGE_MAX_WIDTH: max width of the content column
 */

// CUSTOMIZATION
const CONTROLLER_EMAIL = 'damannaband@gmail.com';
const PAGE_MAX_WIDTH = 'max-w-3xl';
const HEADING_1 = 'text-3xl md:text-4xl font-hero text-white mb-4';
const HEADING_2 = 'text-xl md:text-2xl font-semibold text-white mt-10 mb-3';
const BODY = 'text-gray-300 leading-relaxed mb-4';
const LINK = 'text-white underline hover:text-gray-300 transition-colors';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 md:py-24 flex justify-center">
      <div className={`${PAGE_MAX_WIDTH} w-full`}>
        <button
            onClick={() => window.close()}
            className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
            <span aria-hidden="true">←</span> Close and return
        </button>

        <h1 className={HEADING_1}>Privacy Policy</h1>
        <p className={BODY}>Last updated: February 2026</p>
        <p className={BODY}>
          This privacy policy explains how Dam Anna ("we", "us") collects, uses, and stores
          personal data submitted through this website. We are committed to handling your
          data responsibly and in accordance with the UK General Data Protection Regulation
          (UK GDPR) and the Data Protection Act 2018.
        </p>

        <h2 className={HEADING_2}>Who We Are</h2>
        <p className={BODY}>
          The data controller for this website is Adam Hemmings, a member of Dam Anna.
          If you have any questions about how your data is used, or wish to exercise your
          rights, you can contact us at{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className={LINK}>{CONTROLLER_EMAIL}</a>.
        </p>

        <h2 className={HEADING_2}>What Data We Collect and Why</h2>

        <p className={BODY}><strong className="text-white">Photo submissions (Send Us Your Pics)</strong></p>
        <p className={BODY}>
          When you submit a photo through the "Send Us Your Pics" form, we collect:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
          <li>Your photo (stored in our secure file storage)</li>
          <li>Your email address (required) -- used solely to identify your submission and maintain the security of our upload system. It is never used for marketing.</li>
          <li>Your name or username (optional) -- used only to credit you if your photo is published in our gallery.</li>
          <li>Gig date and location (optional) -- used as context for the photo if published.</li>
        </ul>
        <p className={BODY}>
          The lawful basis for processing this data is <strong className="text-white">consent</strong>.
          By submitting your photo, you are consenting to us reviewing it and, if approved,
          publishing it in our public gallery. You may withdraw your consent at any time by
          contacting us at{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className={LINK}>{CONTROLLER_EMAIL}</a>.
        </p>

        <h2 className={HEADING_2}>How Long We Keep Your Data</h2>
        <p className={BODY}>
          Pending submissions are reviewed within 30 days. If your submission is rejected,
          the photo and associated data are deleted from our systems immediately upon review.
          If your submission is approved and published in the gallery, the photo and any
          credited name are kept indefinitely as part of the gallery. Your email address is
          not retained after the review process is complete.
        </p>

        <h2 className={HEADING_2}>Who Has Access to Your Data</h2>
        <p className={BODY}>
          Your submitted data is accessible only to authorized administrators of this website.
          We do not sell, trade, share, or expose your personal data to any third parties.
          Your data is stored securely using Supabase, a cloud database and storage provider.
          You can read Supabase's data processing policies at{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className={LINK}>
            supabase.com/privacy
          </a>.
        </p>

        <h2 className={HEADING_2}>Your Rights Under UK GDPR</h2>
        <p className={BODY}>You have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
          <li><strong className="text-white">Right of access</strong> -- you can request a copy of the data we hold about you.</li>
          <li><strong className="text-white">Right to erasure</strong> -- you can request that we delete your data at any time.</li>
          <li><strong className="text-white">Right to rectification</strong> -- you can ask us to correct inaccurate data.</li>
          <li><strong className="text-white">Right to restrict processing</strong> -- you can ask us to stop processing your data.</li>
          <li><strong className="text-white">Right to withdraw consent</strong> -- where processing is based on consent, you can withdraw it at any time.</li>
        </ul>
        <p className={BODY}>
          To exercise any of these rights, contact us at{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className={LINK}>{CONTROLLER_EMAIL}</a>.
          We will respond within 30 days. If you are unhappy with how we handle your request,
          you have the right to lodge a complaint with the{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className={LINK}>
            Information Commissioner's Office (ICO)
          </a>.
        </p>

        <h2 className={HEADING_2}>Cookies and Analytics</h2>
        <p className={BODY}>
          This website uses Vercel Analytics to collect anonymised usage data such as page
          views and visitor counts. No personally identifiable information is collected
          through analytics. No cookies are set by this website for tracking or advertising
          purposes.
        </p>

        <h2 className={HEADING_2}>Changes to This Policy</h2>
        <p className={BODY}>
          We may update this policy from time to time. The date at the top of this page
          reflects when it was last revised. Continued use of the site after changes are
          posted constitutes acceptance of the updated policy.
        </p>

        <h2 className={HEADING_2}>Contact</h2>
        <p className={BODY}>
          For any privacy-related questions or data requests, contact us at{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className={LINK}>{CONTROLLER_EMAIL}</a>.
        </p>

      </div>
    </div>
  );
}