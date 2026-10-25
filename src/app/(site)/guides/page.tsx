import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { DOC_PAGES } from '@/lib/docs';
import { SCREENS, type ScreenName } from '@/lib/screens';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Outreach Guides: AI Cold Calling, Cold Email, Buying Signals and Lead Finding — ReachConvert',
  description:
    'Step-by-step guides to AI cold calling, personalized email that reaches the inbox, signal-based outreach, and finding leads that match your ideal customer.',
  path: '/guides',
});

const COVERS: Record<string, ScreenName> = {
  'automate-cold-calls-with-ai': 'calling-campaign',
  'personalized-bulk-email-without-spam': 'email-template',
  'signal-based-outreach': 'signals',
  'find-leads-matching-your-ideal-customer': 'prospects',
};

const GUIDES = DOC_PAGES.filter((doc) => doc.category === 'Guides');

export default function GuidesPage() {
  return (
    <div className="px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <section className="mx-auto w-full max-w-3xl text-center">
        <Reveal>
          <p className="sig-label text-indigo-400">[ GUIDES ]</p>
          <h1 className="sig-display mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            Outreach guides
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Practical guides to AI cold calling, cold email that reaches the inbox, signal-based outreach, and finding
            the right leads. Each one ends with the steps in ReachConvert.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto mt-14 grid w-full max-w-6xl gap-6 md:grid-cols-2">
        {GUIDES.map((guide, i) => {
          const cover = COVERS[guide.slug];
          return (
            <Reveal key={guide.slug} delay={(i % 2) * 60} className="h-full">
              <Link href={`/documentation/${guide.slug}`} className="sig-card group flex h-full flex-col overflow-hidden p-0">
                {cover && (
                  <Image
                    src={SCREENS[cover].image}
                    alt=""
                    sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
                    placeholder="blur"
                    className="block h-auto w-full border-b border-zinc-800"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="sig-display text-xl font-bold text-white">{guide.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{guide.tagline}</p>
                  {guide.audience && <p className="mt-3 text-xs leading-5 text-zinc-500">For {guide.audience.charAt(0).toLowerCase() + guide.audience.slice(1)}</p>}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-indigo-400">
                    Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </section>
    </div>
  );
}
