import { shareCard } from '@/lib/share-card';

// Default link-preview card for every page (LinkedIn, X, Slack, WhatsApp).
// Product pages have their own opengraph-image next to their page.
export const alt = 'ReachConvert — AI cold calling agents and personalized bulk email';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return shareCard({
    eyebrow: 'AI CALLING · EMAIL · SIGNALS',
    title: 'AI cold calling and personalized email, in one workspace',
    shot: 'dashboard',
  });
}
