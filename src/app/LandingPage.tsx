'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Mail,
  PhoneCall,
  Bot,
  Radar,
  Telescope,
  Users,
  BarChart3,
  Check,
  ShieldCheck,
  Clock,
  Upload,
  Wand2,
  Rocket,
  MessageSquare,
  HeartHandshake,
  CirclePlay,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteFooter from '@/components/SiteFooter';
import PublicHeader from '@/components/PublicHeader';
import { CountUp, TiltCard } from '@/components/fx';
import ProductShot from '@/components/ProductShot';

const FEATURES = [
  {
    icon: Mail,
    title: 'Personalized bulk email',
    body: 'Send thousands of tailored emails with AI-written variables, merge fields, and deliverability built in.',
    tone: 'a' as const,
    href: '/email-automation',
  },
  {
    icon: PhoneCall,
    title: 'AI voice calling',
    body: 'Launch calling campaigns where lifelike AI agents dial, qualify, and book on your behalf.',
    tone: 'a2' as const,
    href: '/ai-calling',
  },
  {
    icon: Bot,
    title: 'Configurable calling agents',
    body: 'Design agent personas, scripts, and objection handling, then deploy them across every campaign.',
    tone: 'a3' as const,
    href: '/calling-agents',
  },
  {
    icon: Users,
    title: 'Smart contact segments',
    body: 'Organize contacts by company and intent so the right message reaches the right person automatically.',
    tone: 'a2' as const,
    href: '/documentation/contacts',
  },
  {
    icon: Radar,
    title: 'Signals & playbooks',
    body: 'Watch filings, job posts, news, and bounces for buying signals, then trigger outreach with playbooks.',
    tone: 'a3' as const,
    href: '/buying-signals',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    body: 'Track opens, replies, and call outcomes live, with template and segment performance in one view.',
    tone: 'a' as const,
    href: '/documentation/dashboard',
  },
  {
    icon: Telescope,
    title: 'Prospect Finder',
    body: 'Describe your ideal customer and get matching companies and people, each checked against its own website, ready to add to your contacts.',
    tone: 'a2' as const,
    href: '/prospect-finder',
  },
];

const TONE_STYLES = {
  a: { color: 'var(--a-400)', bg: 'color-mix(in oklab, var(--a-500) 13%, transparent)' },
  a2: { color: 'var(--a2-400)', bg: 'color-mix(in oklab, var(--a2-500) 13%, transparent)' },
  a3: { color: 'var(--a3-400)', bg: 'color-mix(in oklab, var(--a3-500) 13%, transparent)' },
};

const STEPS = [
  {
    icon: Upload,
    title: 'Import your contacts',
    body: 'Bring in leads and let ReachConvert group them into responsive company segments instantly.',
  },
  {
    icon: Wand2,
    title: 'Craft AI campaigns',
    body: 'Generate personalized email templates and calling scripts with the AI copilot in minutes.',
  },
  {
    icon: Rocket,
    title: 'Launch & track live',
    body: 'Fire off email and voice campaigns, then watch replies and bookings roll in on a live dashboard.',
  },
];

const PLANS = [
  {
    name: 'Hosted',
    tagline: 'Sign up at reachconvert.site and start in minutes.',
    points: [
      'Email campaigns, AI calling, signals, prospect finding and analytics',
      'Your data is private to your account',
      'Connect your own AWS SES, Twilio or Plivo, and Gemini keys',
    ],
    cta: { label: 'Start free', href: '/login' },
  },
];

// Product facts, not usage claims — keep these in sync with the backend.
const STATS = [
  { value: '3', label: 'Outreach channels' },
  { value: '2', label: 'Telephony providers' },
  { value: '4', label: 'Signal sources' },
  { value: '24', label: 'Call languages' },
];

function HeroVisual() {
  return (
    <div className="rig-scene relative">
      {/* Orbital rig behind the console */}
      <div className="pointer-events-none absolute -inset-14 hidden sm:block" aria-hidden="true">
        <div className="rig-orbit">
          <span className="rig-node" />
        </div>
        <div className="rig-orbit rig-orbit-2">
          <span className="rig-node rig-node-alt" />
        </div>
      </div>

      {/* Glow behind the console */}
      <div
        className="absolute -inset-6 rounded-[2rem] blur-2xl"
        style={{
          background:
            'linear-gradient(to top right, color-mix(in oklab, var(--a-500) 18%, transparent), color-mix(in oklab, var(--a2-500) 10%, transparent), color-mix(in oklab, var(--a3-500) 16%, transparent))',
        }}
      />

      {/* Float on a wrapper: the animation's transform would override .tilt-body's */}
      <div className="animate-float">
        <TiltCard strength={5}>
          <div className="tilt-body relative rounded-2xl">
            <div className="tilt-glare" />
            <ProductShot name="dashboard" hero sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, 100vw" />
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-zinc-100">
      <PublicHeader landing />

      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate overflow-hidden px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        {/* Layered background: grid + blobs + radar sweep */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid mask-fade-top absolute inset-0" />
          <div
            className="animate-blob absolute -left-24 top-10 h-96 w-96 rounded-full blur-3xl"
            style={{ background: 'color-mix(in oklab, var(--a-500) 16%, transparent)' }}
          />
          <div
            className="animate-blob animation-delay-2000 absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{ background: 'color-mix(in oklab, var(--a2-500) 12%, transparent)' }}
          />
          <div className="absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 opacity-60">
            <div className="sig-radar" />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="sig-label inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-zinc-400 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              AI VOICE + EMAIL · ONE WORKSPACE
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 font-bold text-indigo-400">
                NEW
              </span>
            </span>

            <h1 className="sig-display mt-6 text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Turn cold outreach into{' '}
              <span className="sig-glow animate-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                booked meetings
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              AI voice agents call your leads while personalized emails land in their inbox —
              all triggered by real buying signals and run from one workspace. Live in minutes.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="sig-btn-wrap">
                <Link href="/login" className="sig-btn shimmer group">
                  Start free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </span>
              <a href="#demo" className="sig-btn-ghost">
                <CirclePlay className="h-4 w-4" />
                Watch the demo
              </a>
            </div>

            <div className="sig-label mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> NO CREDIT CARD
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> YOUR DATA STAYS PRIVATE
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-400" /> LIVE IN MINUTES
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ---------------- Demo video ---------------- */}
      <section id="demo" className="scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="sig-label text-indigo-400">[ SEE IT IN ACTION ]</p>
              <h2 className="sig-display mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                From lead list to AI calls
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                In under two minutes, with narration: import leads, send a personalized email
                campaign, then have an AI agent call the same list. Recorded in the real app.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="sig-card mt-12 overflow-hidden">
              <video
                className="block aspect-video w-full bg-zinc-950"
                controls
                playsInline
                preload="metadata"
                poster="/demo/reachconvert-demo-voiceover-poster.jpg"
                aria-label="ReachConvert product demo: importing contacts, launching an email campaign and an AI calling campaign"
              >
                <source src="/demo/reachconvert-demo-voiceover.mp4" type="video/mp4" />
                <track
                  kind="captions"
                  src="/demo/reachconvert-demo-voiceover.vtt"
                  srcLang="en"
                  label="English"
                />
              </video>
            </div>
            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              Recorded in the live product with demo data. Email delivery and calls are simulated,
              so no real messages were sent and no one was called.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="sig-card sig-ticks group p-6 text-center transition-all duration-300 hover:-translate-y-1">
                <p className="sig-glow font-mono text-3xl font-bold tracking-tight text-indigo-300 sm:text-4xl">
                  <CountUp value={stat.value} />
                </p>
                <p className="sig-label mt-2.5 text-zinc-500">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="sig-label text-indigo-400">[ EVERYTHING YOU NEED ]</p>
              <h2 className="sig-display mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                One workspace for AI calling and email automation
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Email, voice, contacts, and analytics work together — no more stitching five tools into
                a fragile funnel.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const tone = TONE_STYLES[feature.tone];
              return (
                <Reveal
                  key={feature.title}
                  delay={(i % 3) * 90}
                  className={`h-full ${
                    i === FEATURES.length - 1 && FEATURES.length % 3 === 1
                      ? 'lg:col-span-3'
                      : ''
                  }`}
                >
                  <TiltCard className="group h-full">
                    <Link href={feature.href} className="tilt-body sig-card sig-ticks relative block h-full overflow-hidden rounded-2xl p-6">
                      <div className="tilt-glare" />
                      <div
                        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: tone.bg }}
                      />
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300"
                        style={{
                          color: tone.color,
                          background: tone.bg,
                          borderColor: `color-mix(in oklab, ${tone.color} 30%, transparent)`,
                          transform: 'translateZ(26px)',
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="sig-display mt-5 text-lg font-bold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.body}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400">
                        Learn more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="sig-label text-indigo-400">[ HOW IT WORKS ]</p>
              <h2 className="sig-display mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                Launch your first campaign today
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="sig-rule pointer-events-none absolute left-0 right-0 top-9 hidden md:block" />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 120}>
                  <div className="sig-card sig-ticks relative p-6 text-center transition-all duration-300 hover:-translate-y-1">
                    <div className="sig-glass mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                      <Icon className="h-7 w-7 text-indigo-400" />
                    </div>
                    <span className="sig-label mt-4 inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-400">
                      0{i + 1} / STEP
                    </span>
                    <h3 className="sig-display mt-3 text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Analytics showcase ---------------- */}
      <section id="analytics" className="scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="sig-label text-indigo-400">[ ANALYTICS ]</p>
              <h2 className="sig-display mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                Real-time performance you can act on
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Every open, reply, and call outcome streams into a live dashboard. Compare templates,
                spot your best segments, and double down on what converts.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Live sync across email and calling campaigns',
                  'Template & company-segment performance breakdowns',
                  'Deliverability, open, reply, and call success rates',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-500/15">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#demo" className="sig-btn-ghost group mt-8">
                See it in action
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <TiltCard strength={5}>
              <div className="tilt-body relative rounded-2xl">
                <div
                  className="absolute -inset-4 rounded-3xl blur-2xl"
                  style={{
                    background:
                      'linear-gradient(to top right, color-mix(in oklab, var(--a-500) 13%, transparent), color-mix(in oklab, var(--a2-500) 13%, transparent))',
                  }}
                />
                <div className="tilt-glare" />
                <ProductShot name="email-tracking" className="relative" sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, 100vw" />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section id="pricing" className="scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="sig-label text-indigo-400">[ PRICING ]</p>
              <h2 className="sig-display mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                Free to use
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                ReachConvert itself costs nothing. You pay your providers directly for what you use.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-5">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 120} className="h-full">
                <div className="sig-card sig-ticks flex h-full flex-col p-7">
                  <p className="sig-label text-indigo-400">{plan.name.toUpperCase()}</p>
                  <p className="sig-display mt-3 text-4xl font-extrabold text-white">
                    $0
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{plan.tagline}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.cta.href} className="sig-btn-ghost group mt-7 justify-center">
                    {plan.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={240}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-zinc-500">
              Usage is billed by your providers, not by us: AWS SES for email, Twilio or Plivo for
              calls, and Google for Gemini. If ReachConvert saves you time, you can{' '}
              <Link href="/support" className="text-indigo-400 hover:text-indigo-300">
                support the project
              </Link>
              . Before you send, read the{' '}
              <Link href="/compliance" className="text-indigo-400 hover:text-indigo-300">
                outreach compliance guide
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-5 py-20 sm:px-8">
        <Reveal>
          <div
            className="sig-ticks sig-ticks-on relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border p-10 text-center shadow-2xl sm:p-16"
            style={{
              borderColor: 'color-mix(in oklab, var(--a-500) 25%, transparent)',
              background:
                'linear-gradient(to top right, color-mix(in oklab, var(--a-500) 12%, var(--z-950)), color-mix(in oklab, var(--a2-500) 8%, var(--z-950)), color-mix(in oklab, var(--a3-500) 10%, var(--z-950)))',
            }}
          >
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" />
            <div
              className="animate-blob absolute -left-10 -top-10 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'color-mix(in oklab, var(--a-500) 22%, transparent)' }}
            />
            <div
              className="animate-blob animation-delay-2000 absolute -bottom-10 -right-10 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'color-mix(in oklab, var(--a3-500) 18%, transparent)' }}
            />
            <div className="relative">
              <p className="sig-label text-indigo-400">[ TRANSMISSION READY ]</p>
              <h2 className="sig-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-5xl">
                Ready to convert more replies?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-zinc-300">
                Use ReachConvert to run email and AI calling campaigns that
                actually book meetings.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <span className="sig-btn-wrap justify-center">
                  <Link href="/login" className="sig-btn shimmer group w-full sm:w-auto">
                    Get started free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </span>
                <Link href="/login" className="sig-btn-ghost justify-center">
                  Sign in
                </Link>
              </div>

              <div className="mx-auto mt-10 max-w-2xl border-t border-zinc-800/80 pt-6">
                <p className="sig-label text-zinc-500">QUESTIONS? TALK TO US</p>
                <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/contact" className="sig-btn-ghost group justify-center">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    Contact us
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/support" className="sig-btn-ghost group justify-center">
                    <HeartHandshake className="h-4 w-4 text-indigo-400" />
                    Support the project
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
