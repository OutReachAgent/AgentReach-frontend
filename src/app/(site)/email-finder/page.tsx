import type { Metadata } from 'next';
import SEOFeaturePage from '@/components/SEOFeaturePage';
import { pageMetadata } from '@/lib/seo';
import { SEO_PAGES } from '@/lib/seo-pages';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Finder: Find and Verify Work Emails at Any Company — ReachConvert',
  description: 'Search a company for people and work emails with your own Hunter.io plan, verify the addresses, and save them to your outreach contacts.',
  path: '/email-finder',
  ownShareImage: true,
});

export default function EmailFinderPage() {
  return <SEOFeaturePage data={SEO_PAGES.emailFinder} />;
}
