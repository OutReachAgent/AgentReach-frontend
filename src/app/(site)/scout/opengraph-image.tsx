import { shareCard } from '@/lib/share-card';

export const alt = 'Scout, the AI outreach assistant in ReachConvert';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return shareCard({ eyebrow: 'SCOUT · AI OUTREACH ASSISTANT', title: 'The assistant that does the outreach legwork', shot: 'scout' });
}
