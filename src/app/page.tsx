'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Zap,
  ArrowRight,
  Sparkles,
  Mail,
  PhoneCall,
  Bot,
  MessageSquareText,
  Users,
  BarChart3,
  Check,
  TrendingUp,
  ShieldCheck,
  Clock,
  Star,
  Menu,
  X,
  Upload,
  Wand2,
  Rocket,
} from 'lucide-react';
import Reveal from '@/components/Reveal';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Analytics', href: '#analytics' },
];

const FEATURES = [
  {
    icon: Mail,
    title: 'Personalized bulk email',
    body: 'Send thousands of tailored emails with AI-written variables, merge fields, and deliverability built in.',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    icon: PhoneCall,
    title: 'AI voice calling',
    body: 'Launch automated calling campaigns where lifelike AI agents dial, qualify, and book on your behalf.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Bot,
    title: 'Configurable calling bots',
    body: 'Design bot personas, scripts, and objection handling, then deploy them across every campaign.',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Smart contact segments',
    body: 'Organize contacts by company and intent so the right message reaches the right person automatically.',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageSquareText,
    title: 'AI chat assistant',
    body: 'Draft templates, refine copy, and get outreach strategy on demand from a built-in AI copilot.',
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    body: 'Track opens, replies, and call outcomes live, with template and segment performance in one view.',
    accent: 'from-rose-500 to-red-500',
  },
];

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

const STATS = [
  { value: '3.2M+', label: 'Emails delivered' },
  { value: '480K', label: 'AI calls placed' },
  { value: '42%', label: 'Avg. reply lift' },
  { value: '12K', label: 'Teams onboard' },
];

const MARQUEE = [
  'Northwind', 'Acme Labs', 'Vertex', 'Lumina', 'Cascade',
  'Brightpath', 'Orbital', 'Meridian', 'Ironclad', 'Quanta',
];

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Zap className="h-5 w-5 text-white" />
      </div>
      <div className="leading-tight">
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          ReachConvert
        </h1>
        <p className="-mt-0.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          AI Outreach Suite
        </p>
      </div>
    </Link>
  );
}

function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/documentation"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-300 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-center text-sm font-semibold text-zinc-200"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroVisual() {
  const bars = [52, 74, 40, 88, 63, 96, 71, 58];
  return (
    <div className="relative">
      {/* Glow behind the window */}
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-2xl" />

      <div className="animate-float relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-2xl backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 pb-4">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <div className="ml-3 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[10px] font-semibold text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live Sync Active
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sent', value: '18,204', tint: 'text-indigo-400' },
            { label: 'Open rate', value: '61%', tint: 'text-purple-400' },
            { label: 'Replies', value: '2,940', tint: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{s.label}</p>
              <p className={`mt-1 text-lg font-black tracking-tight ${s.tint}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Animated chart */}
        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-bold text-white">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Campaign performance
            </p>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
              +18% wk
            </span>
          </div>
          <div className="flex h-28 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <div
                  className="animate-bar rounded-md bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500"
                  style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge cards */}
      <div className="animate-float-slow absolute -left-6 top-24 hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-white">Call booked</p>
            <p className="text-[10px] text-zinc-500">AI agent · 0:42</p>
          </div>
        </div>
      </div>

      <div className="animate-float-slow animation-delay-2000 absolute -right-4 bottom-10 hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-white">AI drafted 40 emails</p>
            <p className="text-[10px] text-zinc-500">in 3 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate overflow-hidden px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid mask-fade-top" />
          <div className="animate-blob absolute -left-24 top-10 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-600/15 blur-3xl" />
          <div className="animate-aurora absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(99,102,241,0.12),rgba(168,85,247,0.10),rgba(236,72,153,0.10),rgba(99,102,241,0.12))] blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                AI voice + email in one workspace
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  New
                </span>
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Turn cold outreach into{' '}
                <span className="animate-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  booked conversations
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
                ReachConvert blends personalized bulk email, autonomous AI calling agents, and
                real-time analytics into one platform — so your team reaches more people and converts
                more replies.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="shimmer group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110"
                >
                  Start free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#features"
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-3.5 text-sm font-bold text-zinc-200 backdrop-blur transition-colors hover:bg-zinc-900"
                >
                  Explore features
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> SOC 2 friendly
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-400" /> Live in minutes
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Marquee ---------------- */}
      <section className="border-y border-zinc-900 bg-zinc-950/60 py-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
          Powering outreach for modern revenue teams
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-14 pr-14">
            {[...MARQUEE, ...MARQUEE].map((name, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-xl font-bold tracking-tight text-zinc-700 transition-colors hover:text-zinc-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="group rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-zinc-900/60">
                <p className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </p>
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
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">Everything you need</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                One workspace for every channel
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
              return (
                <Reveal key={feature.title} delay={(i % 3) * 90}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-700 hover:bg-zinc-900/70">
                    <div
                      className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-tr ${feature.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                    />
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${feature.accent} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.body}</p>
                  </div>
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
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">How it works</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Launch your first campaign today
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent md:block" />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 120}>
                  <div className="relative rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/60">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
                      <Icon className="h-7 w-7 text-indigo-400" />
                    </div>
                    <span className="mt-4 inline-block rounded-full bg-indigo-500/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
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
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">Analytics</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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
              <Link
                href="/login"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-900"
              >
                See it in action
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 blur-2xl" />
              <div className="relative space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur">
                {[
                  { name: 'Founders — Series A', sent: '4,120', open: 68, reply: 24 },
                  { name: 'Growth marketers', sent: '2,880', open: 54, reply: 17 },
                  { name: 'RevOps leaders', sent: '1,540', open: 72, reply: 31 },
                ].map((row) => (
                  <div key={row.name} className="rounded-xl border border-zinc-850/60 bg-zinc-950/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100">{row.name}</span>
                      <span className="rounded-full border border-indigo-500/10 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-400">
                        {row.sent} sent
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-500">Open rate</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-purple-500" style={{ width: `${row.open}%` }} />
                          </div>
                          <span className="font-bold text-zinc-300">{row.open}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500">Reply rate</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.reply}%` }} />
                          </div>
                          <span className="font-bold text-zinc-300">{row.reply}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Testimonial ---------------- */}
      <section className="px-5 py-16 sm:px-8">
        <Reveal>
          <figure className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-850 bg-zinc-900/40 p-8 text-center shadow-xl sm:p-12">
            <div className="mb-5 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl font-semibold leading-8 text-zinc-100 sm:text-2xl">
              “We replaced three tools with ReachConvert. Our reply rates jumped 40% in the first month,
              and the AI calling agents book meetings while we sleep.”
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-sm font-bold text-white">
                JM
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Jordan Meyer</p>
                <p className="text-xs text-zinc-500">Head of Growth, Meridian</p>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-5 py-20 sm:px-8">
        <Reveal>
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/20 p-10 text-center shadow-2xl sm:p-16">
            <div className="animate-blob absolute -left-10 -top-10 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="animate-blob animation-delay-2000 absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to convert more replies?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-zinc-300">
                Join thousands of teams using ReachConvert to run email and AI calling campaigns that
                actually book meetings.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="shimmer group flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg transition-all hover:brightness-95"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-zinc-900 px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Brand />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-zinc-200">
                {link.label}
              </a>
            ))}
            <Link href="/login" className="transition-colors hover:text-zinc-200">
              Sign in
            </Link>
          </nav>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} ReachConvert. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
