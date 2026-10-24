// Public project links shown on the landing, contact, and support pages.

/** Canonical public origin. Metadata, the sitemap, and OG URLs resolve against it. */
export const SITE_URL = 'https://www.reachconvert.site';

export const SITE_NAME = 'ReachConvert';

/** Default description reused by the root metadata, landing page, and OG image. */
export const SITE_DESCRIPTION =
  'Outreach platform with AI cold-calling agents, personalized bulk email, and signal-triggered campaigns in one workspace.';

export const CONTACT_EMAIL = 'oswinalex1@gmail.com';

export const CONTACT_PHONE = '+91 9324498843';

/** CONTACT_PHONE without spaces, as a tel: link. */
export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE.replace(/\s+/g, '')}`;

export const GITHUB_PROFILE_URL = 'https://github.com/Alexoswin';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/oswin-alex-727773260/';

export const PORTFOLIO_URL = 'https://www.oswinalex.site/';

export const SITE_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'AI Calling', href: '/ai-calling' },
  { label: 'Calling agents', href: '/calling-agents' },
  { label: 'Email automation', href: '/email-automation' },
  { label: 'Outreach automation', href: '/outreach-automation' },
  { label: 'Scout AI assistant', href: '/scout' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Docs', href: '/documentation' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'Compare', href: '/compare' },
  { label: 'Contact', href: '/contact' },
  { label: 'Support', href: '/support' },
  { label: 'Sign in', href: '/login' },
];

/** UPI ID shown on /support. Leave empty to show a "coming soon" placeholder. */
export const UPI_ID = 'oswinalex1@okhdfcbank';

/** UPI QR image in /public (e.g. '/upi-qr.png'). Leave empty to show a blank QR placeholder. */
export const UPI_QR_SRC = '/upi-qr.png';
