import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Changelog — ReachConvert',
  description: 'What changed in ReachConvert each month: new features for AI calling, email campaigns, Signals, Prospect Finder, Contact Finder, Scout and the Inbox.',
  path: '/changelog',
});

// User-facing changes by month, drawn from the release history. Newest first.
const RELEASES: { month: string; changes: { title: string; text: string; href?: string }[] }[] = [
  {
    month: 'October 2026',
    changes: [
      { title: 'Scout, the AI outreach assistant', text: 'Ask for contacts, companies, signals or a campaign draft. Scout shows its results as cards and launches nothing until you confirm.', href: '/scout' },
      { title: 'Contact Finder', text: 'Search a company for people and work emails with your own Hunter.io key, verify the addresses, and save them to Contacts.', href: '/email-finder' },
      { title: 'Prospect Finder', text: 'Describe your ideal customer, or list specific companies, and get people checked against each company’s own website, with the evidence for every match.', href: '/prospect-finder' },
      { title: 'Inbox', text: 'Replies to your campaigns arrive in a full inbox with threads, drafts, scheduled sends and a compose window.' },
      { title: 'Unsubscribe links and suppression', text: 'Campaign emails include an unsubscribe link and one-click unsubscribe headers, and unsubscribed addresses are skipped in later campaigns.' },
      { title: 'More than one sending address', text: 'Send from any address or domain you have verified in Amazon SES.' },
      { title: 'Web search during calls', text: 'A calling campaign can let its agent search the web when a question goes beyond the knowledge base.' },
      { title: 'Sign in with Google', text: 'Create an account or sign in with your Google account.' },
    ],
  },
  {
    month: 'August 2026',
    changes: [
      { title: 'CC, BCC and relaunch for email campaigns', text: 'Copy addresses on every send, relaunch a finished campaign, and attach files the same way for every recipient.', href: '/email-automation' },
    ],
  },
  {
    month: 'July 2026',
    changes: [
      { title: 'Signals and playbooks', text: 'Watch your accounts for funding, hiring, launches and news, review matches, and send outreach from playbooks.', href: '/buying-signals' },
      { title: 'Campaign scheduler', text: 'Schedule email and calling campaigns to launch on their own at the time you choose.', href: '/calling-automation' },
      { title: 'More voice languages', text: 'AI calls added Asian languages and more European languages.', href: '/ai-calling' },
      { title: 'Smoother calls', text: 'Faster turn-taking, better noise handling and more accurate speech recognition across languages.' },
      { title: 'Documentation', text: 'User guides and technical documentation for every feature.', href: '/documentation' },
    ],
  },
  {
    month: 'June 2026',
    changes: [
      { title: 'AI calling campaigns', text: 'Gemini Live voice agents call your contacts, with recordings, voice previews, and stop and relaunch controls.', href: '/ai-calling' },
      { title: 'Calling agents with knowledge bases', text: 'Give each agent a persona and a knowledge base built from your own PDFs.', href: '/calling-agents' },
      { title: 'AI-written email templates', text: 'Draft templates from a goal, audience and tone, with an optional reference PDF and attachments.', href: '/email-automation' },
      { title: 'Contacts and directories', text: 'Import contacts from CSV or Excel files and organize them into directories.' },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <section className="mx-auto w-full max-w-3xl">
        <Reveal>
          <p className="sig-label text-indigo-400">[ CHANGELOG ]</p>
          <h1 className="sig-display mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">What’s new</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            New features in ReachConvert, newest first.
          </p>
        </Reveal>

        <div className="mt-14 space-y-14">
          {RELEASES.map((release) => (
            <Reveal key={release.month}>
              <section aria-labelledby={`release-${release.month.replace(' ', '-').toLowerCase()}`} className="grid gap-6 sm:grid-cols-[10rem_1fr]">
                <h2 id={`release-${release.month.replace(' ', '-').toLowerCase()}`} className="sig-label pt-1 text-zinc-500">
                  {release.month.toUpperCase()}
                </h2>
                <ul className="space-y-5 border-l border-zinc-800 pl-6">
                  {release.changes.map((change) => (
                    <li key={change.title}>
                      <h3 className="text-base font-bold text-white">
                        {change.href ? (
                          <Link href={change.href} className="hover:text-indigo-300">
                            {change.title}
                          </Link>
                        ) : (
                          change.title
                        )}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{change.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
