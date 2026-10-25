import type { StaticImageData } from 'next/image';
import callingAgent from '@/assets/screens/calling-agent.webp';
import callingCampaign from '@/assets/screens/calling-campaign.webp';
import contactFinder from '@/assets/screens/contact-finder.webp';
import dashboard from '@/assets/screens/dashboard.webp';
import emailTemplate from '@/assets/screens/email-template.webp';
import emailTracking from '@/assets/screens/email-tracking.webp';
import inbox from '@/assets/screens/inbox.webp';
import playbooks from '@/assets/screens/playbooks.webp';
import prospects from '@/assets/screens/prospects.webp';
import scheduler from '@/assets/screens/scheduler.webp';
import scout from '@/assets/screens/scout.webp';
import signals from '@/assets/screens/signals.webp';

/** Product screenshots captured from the real app with demo data (scripts/screens). */
export const SCREENS = {
  dashboard: {
    image: dashboard,
    path: '/dashboard',
    alt: 'ReachConvert dashboard showing emails sent, open rate, calls made, call success rate, campaign performance and top company segments',
  },
  'email-template': {
    image: emailTemplate,
    path: '/email-campaigns',
    alt: 'Email campaign builder showing an AI-written email with first name and company merge fields',
  },
  'email-tracking': {
    image: emailTracking,
    path: '/email-campaigns',
    alt: 'Email campaign results with sent, delivered, opened, replied, bounced and unsubscribed counts and a per-recipient list',
  },
  'calling-campaign': {
    image: callingCampaign,
    path: '/calling-campaigns',
    alt: 'AI call log with the call summary, collected data such as a booked demo time, and the conversation transcript',
  },
  'calling-agent': {
    image: callingAgent,
    path: '/ai-calling-bots',
    alt: 'Calling agent editor with the agent personality, objective, goal, conversation flow and knowledge base',
  },
  scheduler: {
    image: scheduler,
    path: '/scheduler',
    alt: 'Scheduler listing upcoming email and calling campaign launches with their dates and times',
  },
  signals: {
    image: signals,
    path: '/signals',
    alt: 'Signals feed showing funding, hiring and product launch signals for watched companies, with triggered outreach counts',
  },
  playbooks: {
    image: playbooks,
    path: '/signals/playbooks',
    alt: 'Signal playbooks that send automatically or wait for review, with cooldowns and daily caps',
  },
  prospects: {
    image: prospects,
    path: '/prospects',
    alt: 'Prospect Finder results with match scores and, for each criterion, the quote and source page from the company website',
  },
  'contact-finder': {
    image: contactFinder,
    path: '/contact-finder',
    alt: 'Contact Finder results listing people at a company with their work email, confidence score and verification status',
  },
  inbox: {
    image: inbox,
    path: '/inbox',
    alt: 'Inbox showing replies to email campaigns, with a reply open next to the original campaign email',
  },
  scout: {
    image: scout,
    path: '/ai-command-center',
    alt: 'Scout assistant answering a request with a Contact Finder card of new people to save, each with a verification status',
  },
} satisfies Record<string, { image: StaticImageData; path: string; alt: string }>;

export type ScreenName = keyof typeof SCREENS;
