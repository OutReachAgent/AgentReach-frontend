import type { Metadata } from 'next';
import SEOFeaturePage from '@/components/SEOFeaturePage';
import { pageMetadata } from '@/lib/seo';
import { SEO_PAGES } from '@/lib/seo-pages';

export const metadata: Metadata = pageMetadata({
  title: 'Buying Signals and Playbooks for Signal-Based Outreach — ReachConvert',
  description: 'Watch your accounts for funding, hiring, launches, and news, match each signal to the right contacts, and send or review outreach with playbooks.',
  path: '/buying-signals',
  ownShareImage: true,
});

export default function BuyingSignalsPage() {
  return <SEOFeaturePage data={SEO_PAGES.buyingSignals} />;
}
