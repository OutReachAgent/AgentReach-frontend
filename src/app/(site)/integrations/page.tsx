import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, Check, ExternalLink, KeyRound, Mail, PhoneCall, UserSearch } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Integrations: Amazon SES, Twilio, Plivo, Gemini and Hunter.io — ReachConvert',
  description:
    'ReachConvert runs on your own provider accounts. See what Amazon SES, Twilio, Plivo, Google Gemini and Hunter.io each power, what you need to connect them, and where to check their pricing.',
  path: '/integrations',
});

// Keep each claim true of the current code: Settings, the provider tests, and
// the features each key unlocks.
const PROVIDERS = [
  {
    name: 'Amazon SES',
    role: 'Email delivery',
    icon: Mail,
    powers: 'Sends every campaign and Inbox email from your own verified address. With reply tracking set up, replies come back to your Inbox, and bounce and complaint events keep those addresses out of later campaigns.',
    needs: ['AWS access key and secret', 'Region and a verified sender address', 'Optional: a reply tracking domain, SNS topic, and configuration set'],
    pricing: 'https://aws.amazon.com/ses/pricing/',
  },
  {
    name: 'Twilio',
    role: 'Phone calls',
    icon: PhoneCall,
    powers: 'Places AI calls from your own number, streams the audio to the voice agent, and keeps a recording of each call.',
    needs: ['Account SID and auth token', 'A phone number that can make outbound calls'],
    pricing: 'https://www.twilio.com/en-us/voice/pricing',
  },
  {
    name: 'Plivo',
    role: 'Phone calls',
    icon: PhoneCall,
    powers: 'An alternative to Twilio for placing AI calls from your own number. Choose the provider in Settings.',
    needs: ['Auth ID and auth token', 'A phone number that can make outbound calls'],
    pricing: 'https://www.plivo.com/voice/pricing/',
  },
  {
    name: 'Google Gemini',
    role: 'AI',
    icon: Bot,
    powers: 'Runs the live voice of calling agents, drafts email templates, powers Scout and Prospect Finder, and helps classify buying signals.',
    needs: ['A Gemini API key', 'A text model, chosen in Settings'],
    pricing: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
  {
    name: 'Hunter.io',
    role: 'Contact data',
    icon: UserSearch,
    powers: 'Finds people and work emails at a company and verifies addresses, in Contact Finder and when Scout looks for contacts.',
    needs: ['A Hunter API key. The Free plan works, with 10 results per search.'],
    pricing: 'https://hunter.io/pricing',
  },
];

const SECURITY = [
  'Keys are stored with AES-256-GCM encryption and are never shown back in full.',
  'Each provider has a Test button in Settings, so you know a key works before a campaign needs it.',
  'Each account’s keys are used only for that account’s campaigns, searches and calls.',
];

export default function IntegrationsPage() {
  return (
    <div className="px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      {/* ---------------- Hero ---------------- */}
      <section className="mx-auto w-full max-w-3xl text-center">
        <Reveal>
          <p className="sig-label text-indigo-400">[ INTEGRATIONS ]</p>
          <h1 className="sig-display mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            Runs on the accounts you already own
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            ReachConvert itself is free. Email, calls, AI and contact data come from your own provider accounts, which
            bill you directly. Connect only the ones you need.
          </p>
        </Reveal>
      </section>

      {/* ---------------- Providers ---------------- */}
      <section className="mx-auto mt-14 grid w-full max-w-5xl gap-5 md:grid-cols-2">
        {PROVIDERS.map((provider, i) => (
          <Reveal key={provider.name} delay={(i % 2) * 60} className="h-full">
            <div className="sig-card flex h-full flex-col p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <provider.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{provider.name}</h2>
                  <p className="sig-label text-zinc-500">{provider.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{provider.powers}</p>
              <p className="sig-label mt-5 text-zinc-500">YOU NEED</p>
              <ul className="mt-2 flex-1 space-y-2">
                {provider.needs.map((need) => (
                  <li key={need} className="flex gap-2.5 text-sm leading-6 text-zinc-400">
                    <KeyRound className="mt-1 h-4 w-4 flex-none text-zinc-600" />
                    {need}
                  </li>
                ))}
              </ul>
              <a
                href={provider.pricing}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {provider.name} pricing <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------------- Security ---------------- */}
      <section className="mx-auto mt-20 w-full max-w-3xl">
        <Reveal>
          <p className="sig-label text-indigo-400">[ YOUR KEYS ]</p>
          <h2 className="sig-display mt-3 text-2xl font-extrabold text-white sm:text-3xl">How your keys are kept</h2>
          <ul className="mt-6 space-y-3">
            {SECURITY.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-6 text-zinc-300">
                <Check className="mt-1 h-4 w-4 flex-none text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------------- CTA ---------------- */}
      <Reveal>
        <div className="mx-auto mt-16 flex max-w-xl flex-col justify-center gap-3 sm:flex-row">
          <span className="sig-btn-wrap justify-center">
            <Link href="/login" className="sig-btn group w-full sm:w-auto">
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </span>
          <Link href="/documentation/settings" className="sig-btn-ghost justify-center">
            Settings documentation
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
