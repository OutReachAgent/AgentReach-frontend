import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Brand } from '@/components/fx';

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'AI calling', href: '/ai-calling' },
      { label: 'Calling agents', href: '/calling-agents' },
      { label: 'Calling automation', href: '/calling-automation' },
      { label: 'Email automation', href: '/email-automation' },
      { label: 'Outreach automation', href: '/outreach-automation' },
      { label: 'Scout AI assistant', href: '/scout' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/documentation' },
      { label: 'Compare tools', href: '/compare' },
      { label: 'Compliance guide', href: '/compliance' },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy policy', href: '/privacy' },
    ],
  },
];

/** Public-site footer shared by the landing page and public pages. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-850 px-5 pb-8 pt-16 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_2fr]">
          <div>
            <Link href="/" aria-label="ReachConvert home" className="inline-flex">
              <Brand />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-400">
              AI calling and email automation for teams that want one clear outreach workflow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login" className="sig-btn group !px-4 !py-2.5">
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/documentation" className="sig-btn-ghost !px-4 !py-2.5">Read docs</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="sig-label text-zinc-300">{group.title}</h2>
                <nav className="mt-4 flex flex-col items-start gap-3" aria-label={`${group.title} links`}>
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm text-zinc-500 transition-colors hover:text-indigo-300">{link.label}</Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-zinc-850 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} REACHCONVERT</p>
          <p>All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
