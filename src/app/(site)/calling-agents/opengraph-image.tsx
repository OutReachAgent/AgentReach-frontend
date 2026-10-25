import { shareCard } from '@/lib/share-card';
import { SEO_PAGES } from '@/lib/seo-pages';

export const alt = SEO_PAGES.callingAgents.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const { eyebrow, title } = SEO_PAGES.callingAgents;
  return shareCard({ eyebrow, title, shot: 'calling-agent' });
}
