import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleHelp,
  Hand,
  Inbox,
  KeyRound,
  Loader2,
  Mail,
  MousePointerClick,
  Radar,
  ShieldCheck,
  Square,
  Telescope,
  UserSearch,
  Wallet,
} from 'lucide-react';
import { ScoutLogo } from '@/components/assistant/ScoutLogo';
import ProductShot from '@/components/ProductShot';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const PATH = '/scout';
const TITLE = 'Scout: the AI outreach assistant that does the legwork';
const DESCRIPTION =
  'Scout finds contacts and hiring companies, reads your Signals and inbox, and drafts email or calling campaigns that launch only when you confirm.';

export const metadata: Metadata = pageMetadata({
  title: 'Scout: AI Outreach Assistant for Contacts, Signals and Campaigns — ReachConvert',
  description: DESCRIPTION,
  path: PATH,
  ownShareImage: true,
});

const CAPABILITIES = [
  { icon: UserSearch, title: 'Find the right people', text: 'Ask for HR leaders at a company and Scout searches Hunter.io, flags who you already have, and lets you save the rest to a list.' },
  { icon: Telescope, title: 'Discover hiring companies', text: 'Describe the companies you want and Scout runs Prospect Finder, reading each company’s own website before anyone is suggested.' },
  { icon: Radar, title: 'Act on Signals', text: 'Get a summary of funding, hiring and news signals, and a prepared next step for the ones worth acting on.' },
  { icon: Mail, title: 'Draft campaigns', text: 'Scout writes the email or calling campaign for the contacts you pick and shows the full preview first.' },
  { icon: Inbox, title: 'Catch up on replies', text: 'Ask what came in overnight and get the replies that need you, not a list of every message.' },
  { icon: BarChart3, title: 'Know your numbers', text: 'Opens, replies, calls and scheduled launches, answered in a sentence instead of a dashboard hunt.' },
];

const SAFEGUARDS = [
  { icon: Hand, title: 'Nothing sends without you', text: 'Every launch waits for Confirm on the exact preview you saw. Cancel removes the draft.' },
  { icon: ShieldCheck, title: 'No invented contacts', text: 'Scout can only save people a search actually returned, with the source and verification status kept.' },
  { icon: Wallet, title: 'Credits stay in check', text: 'Each answer is capped at three Hunter searches and one Prospect Finder search, and every paid step says so.' },
  { icon: Square, title: 'Stop means stop', text: 'Press Stop and the work ends on the server too, so no searches run after you change your mind.' },
];

const STEPS = [
  { icon: KeyRound, title: 'Connect your keys', text: 'Add your Gemini key in Settings, plus a Hunter.io key if you want Scout to find contacts. Usage is billed to your own accounts.' },
  { icon: MousePointerClick, title: 'Ask from any page', text: 'Click the Scout button in the corner of the app and type what you need. It stays open while you move around.' },
  { icon: Check, title: 'Review and confirm', text: 'Results arrive as cards you can act on. Launches happen only when you confirm the preview.' },
];

const PROMPTS = [
  'Find HR leaders at razorpay.com and save them to a list called Razorpay HR',
  'Which companies in my Signals raised funding this week?',
  'Summarize my unread replies and tell me who to follow up with',
  'Draft a short intro email to the contacts in github-contacts',
  'Find companies hiring backend engineers in Bengaluru',
  'Which campaigns are scheduled for tomorrow?',
];

const FAQS = [
  { question: 'What is Scout?', answer: 'Scout is the AI assistant built into ReachConvert. It uses your workspace data and the same tools you use in the app, such as Contact Finder, Prospect Finder, Signals and campaigns, to answer questions and prepare work for you.' },
  { question: 'Can Scout send emails or place calls by itself?', answer: 'No. Scout prepares campaigns and Signal actions as previews. Nothing is sent or launched until you press Confirm on that exact preview.' },
  { question: 'What does Scout cost?', answer: 'Scout runs on your own Gemini API key, and contact searches use your own Hunter.io plan. ReachConvert caps how many paid searches one answer can run and shows each one as it happens.' },
  { question: 'Where do the contacts come from?', answer: 'From Hunter.io through Contact Finder, or from companies’ own public websites through Prospect Finder. Scout keeps the confidence score, verification status and source with every contact it saves.' },
  { question: 'Is finding someone the same as having consent to contact them?', answer: 'No. You remain responsible for having a lawful reason to contact each person and for honouring opt-outs. Review the compliance guide before you send or call.' },
];

const RELATED = [
  { label: 'Scout documentation', href: '/documentation/scout' },
  { label: 'Prospect Finder', href: '/prospect-finder' },
  { label: 'Outreach automation', href: '/outreach-automation' },
  { label: 'Compliance guide', href: '/compliance' },
];

function ChatPreview() {
  return (
    <div className="sig-card relative overflow-hidden p-0" aria-hidden="true">
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-4 py-3">
        <ScoutLogo className="h-7 w-7" />
        <div>
          <p className="text-sm font-bold text-white">Scout</p>
          <p className="text-[11px] text-zinc-500">Your outreach assistant</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500 px-3.5 py-2 text-sm text-white">
            Find HR leaders at razorpay.com and save them to Razorpay HR
          </p>
        </div>
        <div className="flex gap-2.5">
          <ScoutLogo className="h-6 w-6 flex-none" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-xs">
              <p className="flex items-center gap-2 text-zinc-500"><Check className="h-3.5 w-3.5 text-emerald-400" /> Reading your contacts</p>
              <p className="flex items-center gap-2 text-zinc-300"><Loader2 className="h-3.5 w-3.5 text-indigo-400" /> Searching Hunter for people at razorpay.com · uses 1 Hunter search</p>
            </div>
            <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Contact Finder</p>
              <p className="mt-1 text-sm font-semibold text-white">3 new people at Razorpay</p>
              <div className="mt-2 divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60 text-xs">
                {[
                  ['Head of Talent', '94%', 'Verified'],
                  ['HR Business Partner', '88%', 'Verified'],
                  ['Talent Acquisition Lead', '71%', 'Accept-all'],
                ].map(([title, score, status]) => (
                  <div key={title} className="flex items-center gap-2.5 px-2.5 py-2">
                    <span className="h-3 w-3 rounded border border-indigo-400 bg-indigo-500" />
                    <span className="flex-1 truncate text-zinc-300">{title}</span>
                    <span className="rounded bg-emerald-500/10 px-1.5 text-[10px] font-bold text-emerald-300">{score}</span>
                    <span className="hidden rounded bg-zinc-800 px-1.5 text-[10px] text-zinc-400 sm:inline">{status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex justify-end">
                <span className="rounded-lg bg-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white">Save 3 to Contacts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScoutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: TITLE,
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="flex items-center gap-3">
                <ScoutLogo className="h-12 w-12 shadow-lg shadow-indigo-500/30" />
                <p className="sig-label text-indigo-400">[ SCOUT · AI OUTREACH ASSISTANT ]</p>
              </div>
              <h1 className="sig-display mt-6 text-4xl font-extrabold leading-[1.04] text-white sm:text-6xl">
                The assistant that does the outreach legwork
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Ask Scout for the people, companies, signals or campaign you need. It works across your ReachConvert
                workspace, shows its results as cards you can act on, and launches nothing until you confirm.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="sig-btn group justify-center">
                  Try Scout free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/documentation/scout" className="sig-btn-ghost justify-center">
                  Read the Scout guide
                </Link>
              </div>
            </div>
            <ChatPreview />
          </div>

          <section className="mt-24" aria-labelledby="capabilities-heading">
            <p className="sig-label text-indigo-400">[ WHAT SCOUT DOES ]</p>
            <h2 id="capabilities-heading" className="sig-display mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">
              One request instead of six tabs
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((item) => (
                <div key={item.title} className="sig-card sig-ticks p-6">
                  <item.icon className="h-5 w-5 text-indigo-400" />
                  <h3 className="sig-display mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-24" aria-labelledby="in-app-heading">
            <p className="sig-label text-indigo-400">[ IN THE APP ]</p>
            <h2 id="in-app-heading" className="sig-display mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">
              Results arrive as cards you can act on
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Asked for operations people at a retailer, Scout searched Hunter.io, left out the two people already in
              Contacts, and showed each new person&apos;s verification status before saving anything.
            </p>
            <ProductShot name="scout" className="mt-8" sizes="(min-width: 1152px) 1152px, 100vw" />
          </section>

          <section className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="control-heading">
            <div>
              <p className="sig-label text-indigo-400">[ YOU STAY IN CONTROL ]</p>
              <h2 id="control-heading" className="sig-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Built to prepare, not to act on its own
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Outreach reaches real people, so Scout is careful by design: previews before launches, real data
                only, and visible spending.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SAFEGUARDS.map((item) => (
                <div key={item.title} className="sig-card p-5">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                  <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-24 grid gap-12 lg:grid-cols-2" aria-labelledby="steps-heading">
            <div>
              <p className="sig-label text-indigo-400">[ HOW IT WORKS ]</p>
              <h2 id="steps-heading" className="sig-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Ready in three steps
              </h2>
              <div className="mt-8 space-y-4">
                {STEPS.map((step, index) => (
                  <div key={step.title} className="sig-card flex gap-4 p-5">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-indigo-500/15 font-mono text-sm font-bold text-indigo-300">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-bold text-white">
                        <step.icon className="h-4 w-4 text-indigo-400" /> {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="sig-label text-indigo-400">[ TRY ASKING ]</p>
              <h2 className="sig-display mt-3 text-3xl font-extrabold text-white sm:text-4xl">Things people ask Scout</h2>
              <div className="mt-8 space-y-3">
                {PROMPTS.map((prompt) => (
                  <p key={prompt} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300">
                    “{prompt}”
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-24 max-w-4xl" aria-labelledby="faq-heading">
            <div className="flex items-center gap-3">
              <CircleHelp className="h-5 w-5 text-indigo-400" />
              <h2 id="faq-heading" className="sig-display text-2xl font-extrabold text-white sm:text-3xl">
                Frequently asked questions
              </h2>
            </div>
            <div className="mt-6 divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-5">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 font-semibold text-white marker:hidden">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <nav className="mt-20 border-t border-zinc-800 pt-8" aria-label="Related pages">
            <p className="sig-label text-zinc-500">RELATED REACHCONVERT PAGES</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {RELATED.map((link) => (
                <Link key={link.href} href={link.href} className="sig-btn-ghost">
                  {link.label} <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </article>
    </>
  );
}
