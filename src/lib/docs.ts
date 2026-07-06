/**
 * Documentation content model. Each feature is a `DocPage` rendered by
 * src/app/documentation/[slug]/page.tsx. Keeping content as data (not JSX)
 * keeps every doc page visually consistent and easy to extend.
 */

export type DocIcon =
  | 'rocket'
  | 'layout-dashboard'
  | 'radar'
  | 'users'
  | 'mail'
  | 'phone'
  | 'bot'
  | 'message'
  | 'history'
  | 'settings'
  | 'user';

export interface DocCapability {
  title: string;
  text: string;
}

export interface DocSection {
  heading: string;
  body?: string[];
  capabilities?: DocCapability[];
  steps?: string[];
  code?: { caption?: string; lines: string[] };
}

export interface DocPage {
  slug: string;
  title: string;
  tagline: string;
  icon: DocIcon;
  category: string;
  intro: string[];
  sections: DocSection[];
  tips?: string[];
  related?: string[];
}

export const DOC_CATEGORIES = [
  'Getting started',
  'Core features',
  'AI outreach',
  'Configuration',
] as const;

export const DOC_PAGES: DocPage[] = [
  // ─────────────────────────────── Getting started
  {
    slug: 'quick-start',
    title: 'Quick start',
    tagline: 'Go from sign-up to your first tracked campaign in five steps.',
    icon: 'rocket',
    category: 'Getting started',
    intro: [
      'ReachConvert unifies personalized bulk email, autonomous AI voice calling, and signal-based automation in one workspace. This guide gets a brand-new account to its first live, tracked campaign.',
    ],
    sections: [
      {
        heading: 'The five-minute path',
        steps: [
          'Create your account and sign in — you land on the Outreach Dashboard.',
          'Open Settings and connect at least one channel: AWS SES for email, or a Gemini Live key for AI calling.',
          'Go to Contacts and import a CSV/XLSX, mapping columns to name, email, company, and job title.',
          'Build a template under Email Campaigns (write it yourself or generate it with AI), then create a campaign and add contacts.',
          'Hit Launch and watch deliveries, opens, and replies stream into the Dashboard in real time.',
        ],
      },
      {
        heading: 'What to set up next',
        capabilities: [
          {
            title: 'Turn on Signals',
            text: 'Importing contacts automatically starts watching their companies. Create a Playbook so funding, hiring, and news events trigger outreach on their own.',
          },
          {
            title: 'Configure AI calling',
            text: 'Add a Gemini Live key and design an AI Bot persona to run automated voice campaigns through Twilio.',
          },
          {
            title: 'Personalize your workspace',
            text: 'Pick a theme and accent color under Profile — the whole app recolors instantly.',
          },
        ],
      },
    ],
    tips: [
      'You can run entirely in mock mode for email: with test AWS keys, sends are simulated so you can explore the full flow without real delivery.',
      'Every list view supports live sync — leave the Dashboard open during a launch to watch metrics update every 10 seconds.',
    ],
    related: ['dashboard', 'contacts', 'email-campaigns', 'signals'],
  },

  // ─────────────────────────────── Core features
  {
    slug: 'dashboard',
    title: 'Dashboard',
    tagline: 'A real-time command center for every channel you run.',
    icon: 'layout-dashboard',
    category: 'Core features',
    intro: [
      'The Dashboard is the first screen you see. It aggregates email deliverability, AI calling outcomes, template performance, and your most responsive company segments into a single live view that refreshes automatically.',
    ],
    sections: [
      {
        heading: 'Metrics at a glance',
        capabilities: [
          { title: 'Emails Sent', text: 'Total dispatched with a delivered-vs-failed breakdown.' },
          { title: 'Email Open Rate', text: 'Open percentage alongside your reply rate.' },
          { title: 'Calls Made', text: 'Volume of AI voice calls placed across campaigns.' },
          { title: 'Call Success Rate', text: 'Connected/qualified rate with average call duration.' },
        ],
      },
      {
        heading: 'Charts and tables',
        body: [
          'The Campaign Performance chart compares emails sent against opens and replies so you can see which sends actually landed.',
          'Top Company Segments ranks the organizations most responsive to your outreach, with open- and reply-rate bars per segment.',
          'The Template Performance table breaks down each template by campaign uses, open rate, and reply rate — your fastest read on what messaging converts.',
        ],
      },
      {
        heading: 'Live sync',
        body: [
          'A “Live Sync Active” badge indicates the Dashboard is polling for fresh data every 10 seconds. Launch a campaign in another tab and the numbers here move on their own — no refresh needed.',
        ],
      },
    ],
    tips: [
      'If the Dashboard shows an error, it almost always means the backend or database is unreachable — check that the NestJS server is running.',
    ],
    related: ['email-campaigns', 'ai-calling', 'history'],
  },
  {
    slug: 'signals',
    title: 'Signals — campaigns that trigger themselves',
    tagline: 'Watch your accounts and reach out the moment a buying signal fires.',
    icon: 'radar',
    category: 'Core features',
    intro: [
      'Signals is ReachConvert’s flagship differentiator. Instead of you deciding when to send, the platform continuously watches your contacts’ companies for buying signals — funding rounds, hiring surges, product launches, news, and job changes — and triggers the right outreach within hours of the event.',
      'Timing is the strongest predictor of reply rates. A “congrats on the raise” email sent the same day dramatically outperforms the same message three weeks later.',
    ],
    sections: [
      {
        heading: 'How it works',
        steps: [
          'Company watches are created automatically from the email domains of contacts you import (free-mail domains are skipped).',
          'Collectors poll public sources on a schedule — Google News, SEC EDGAR filings, and public hiring boards — plus your own send telemetry.',
          'Each detected item is classified into a signal type and de-duplicated, then matched to the contacts it applies to.',
          'Playbooks decide what happens: auto-send for high-confidence matches, or queue a draft in the Review Queue for your approval.',
          'Triggered outreach reuses the email pipeline, injecting signal details into your template, and is tracked separately so you can compare its lift against manual sends.',
        ],
      },
      {
        heading: 'Signal types detected',
        capabilities: [
          { title: 'Funding round', text: 'Fundraises inferred from news and SEC Form D filings.' },
          { title: 'Hiring surge', text: 'A jump in open roles on a company’s public job board.' },
          { title: 'Company news', text: 'Acquisitions, expansions, and other notable coverage.' },
          { title: 'Product launch', text: 'New product or feature announcements.' },
          { title: 'Job change', text: 'A contact leaving their company, inferred from bounce telemetry.' },
        ],
      },
      {
        heading: 'Playbooks',
        body: [
          'A playbook is a rule: “when signal X fires for audience Y, send template Z.” Build one with the three-step wizard — pick trigger signal types, choose an audience (a contact directory or everyone), then select a template and mode.',
          'Review mode queues drafts for approval; Auto mode sends instantly, but only for high-confidence matches.',
        ],
      },
      {
        heading: 'Guardrails',
        body: [
          'Because automated sending can damage deliverability, every playbook enforces guardrails: a per-contact cooldown (default 30 days), a per-playbook daily send cap (default 50), duplicate suppression so the same signal never fires twice for the same contact, and pausing to stop a playbook instantly.',
        ],
      },
      {
        heading: 'Signal template variables',
        body: [
          'Reference the event directly in any template so the message feels hand-written:',
        ],
        code: {
          caption: 'Available in subject and body',
          lines: [
            '{{signal.type}}     → e.g. "Funding round"',
            '{{signal.summary}}  → one-line description of the event',
            '{{signal.date}}     → when it happened',
            '{{signal.company}}  → the company name',
            '{{signal.url}}      → source link',
            '{{signal.detail.roundSize}} → extracted entity (when available)',
          ],
        },
      },
    ],
    tips: [
      'No external keys required to explore: without a Gemini key, a built-in keyword classifier handles signal typing so the whole flow works in dev.',
      'Use the “Add signal” button to inject a manual signal (e.g. “saw them speak at a conference”) and match it to a specific contact by email.',
      'Hit “Scan now” to run a collection poll immediately instead of waiting for the scheduled cycle.',
    ],
    related: ['contacts', 'email-campaigns', 'dashboard'],
  },
  {
    slug: 'contacts',
    title: 'Contacts',
    tagline: 'Import, organize, and segment the people you reach.',
    icon: 'users',
    category: 'Core features',
    intro: [
      'Contacts is your source of truth for everyone you reach out to. Import in bulk, organize into directories, and enrich each record with the custom fields your templates personalize against.',
    ],
    sections: [
      {
        heading: 'Importing contacts',
        steps: [
          'Click Import and upload a CSV or XLSX file.',
          'Map your spreadsheet columns to ReachConvert fields — first name, last name, email, company, job title, phone, and any custom fields.',
          'Choose a duplicate strategy: Skip existing rows or Overwrite them.',
          'Optionally assign the whole import to a directory, then confirm.',
        ],
      },
      {
        heading: 'Directories (segments)',
        body: [
          'Directories group contacts — by company type, seniority, region, or any axis you choose. They power targeted campaigns and let Signals playbooks scope to a specific audience.',
          'The Dashboard’s Top Company Segments view is built from this organization, surfacing which groups respond best.',
        ],
      },
      {
        heading: 'Custom fields & personalization',
        body: [
          'Any column beyond the standard fields is stored as a custom field and becomes available as a template variable — for example a {{industry}} column becomes usable as a merge tag in your emails and calling scripts.',
        ],
      },
    ],
    tips: [
      'Importing contacts automatically starts Signal watches for their company domains — no extra step to begin monitoring accounts.',
      'Keep company names consistent across rows so segment analytics and signal matching group them correctly.',
    ],
    related: ['email-campaigns', 'signals', 'ai-calling'],
  },
  {
    slug: 'email-campaigns',
    title: 'Email campaigns',
    tagline: 'Personalized bulk outreach with tracking and AI-written copy.',
    icon: 'mail',
    category: 'Core features',
    intro: [
      'Email Campaigns sends personalized bulk email through AWS SES with per-recipient merge fields, delivery tracking, and optional attachments. Templates can be written by hand or generated by AI from a short brief.',
    ],
    sections: [
      {
        heading: 'Building templates',
        capabilities: [
          {
            title: 'AI generation',
            text: 'Describe your goal, audience, and tone, and the AI drafts a subject and body with merge variables in place. Generation runs as a background job you can watch.',
          },
          {
            title: 'Manual authoring',
            text: 'Write HTML or plain-text templates directly, using {{firstName}}, {{company}}, and any custom field as variables.',
          },
          {
            title: 'Attachments',
            text: 'Attach files to a template; they ride along with every personalized send.',
          },
        ],
      },
      {
        heading: 'Launching a campaign',
        steps: [
          'Create a campaign and select a template.',
          'Add contacts individually or by directory.',
          'Click Launch — each recipient gets an individually interpolated copy.',
          'Watch delivery status per recipient (Pending → Sent/Failed) and monitor opens and replies.',
        ],
      },
      {
        heading: 'Relaunching',
        body: [
          'Launching a completed campaign again re-queues every recipient with a fresh delivery attempt — useful for follow-up waves. The button reads “Launch Again” once a campaign has run.',
        ],
      },
    ],
    tips: [
      'With test/mock AWS keys, sends are simulated (about 90% success) so you can rehearse the full flow without delivering real mail.',
      'Signal-triggered campaigns reuse this exact pipeline, so anything you learn here applies to automated outreach too.',
    ],
    related: ['contacts', 'signals', 'dashboard', 'settings'],
  },
  {
    slug: 'history',
    title: 'History',
    tagline: 'A complete audit trail of every email and call.',
    icon: 'history',
    category: 'Core features',
    intro: [
      'History is the searchable record of everything ReachConvert has sent or dialed. Email history and call history live side by side so you can trace any interaction end to end.',
    ],
    sections: [
      {
        heading: 'Email history',
        body: [
          'Every dispatched message is logged with its recipient, subject, delivery status, timestamp, and open/reply flags — the raw data behind your Dashboard metrics.',
        ],
      },
      {
        heading: 'Call history',
        body: [
          'Each AI call records its outcome, duration, and — where available — a transcript and recording, so you can audit exactly what the agent said and how the prospect responded.',
        ],
      },
    ],
    tips: ['Use History to debug deliverability: a cluster of failures usually points to a credential or domain issue in Settings.'],
    related: ['email-campaigns', 'ai-calling', 'dashboard'],
  },

  // ─────────────────────────────── AI outreach
  {
    slug: 'ai-calling',
    title: 'AI calling campaigns',
    tagline: 'Autonomous voice agents that dial, qualify, and log calls.',
    icon: 'phone',
    category: 'AI outreach',
    intro: [
      'AI Calling runs automated outbound voice campaigns. A Gemini Live agent places calls through Twilio, holds a natural conversation using the persona and script you define, and logs the transcript and outcome for every call.',
    ],
    sections: [
      {
        heading: 'Setting up a campaign',
        steps: [
          'Add and verify a Gemini API key for Gemini Live in Settings, plus your Twilio credentials.',
          'Create a calling campaign: give it an objective, a prompt/script, and choose a voice and language.',
          'Attach an AI Bot persona (or configure the agent inline) and add contacts.',
          'Start the dialer — Twilio queues the calls and the agent begins conversations.',
        ],
      },
      {
        heading: 'Conversation controls',
        capabilities: [
          { title: 'Voice & language', text: 'Choose from Gemini Live HD voices and set the spoken language.' },
          { title: 'Who speaks first', text: 'Decide whether the AI opens the call or waits for the prospect.' },
          { title: 'Interruption handling', text: 'Tune how the agent handles being interrupted for a natural cadence.' },
        ],
      },
      {
        heading: 'Relaunching & monitoring',
        body: [
          'Relaunch re-queues pending or unconnected calls. Twilio queue status appears in the call logs, and each completed call surfaces its duration, transcript, and recording in History.',
        ],
      },
    ],
    tips: [
      'Latency matters for natural conversation — keep prompts focused and avoid overly long system instructions.',
      'If no calls queue, verify your Twilio credentials and that your public callback URL is reachable.',
    ],
    related: ['ai-bots', 'contacts', 'settings', 'history'],
  },
  {
    slug: 'ai-bots',
    title: 'AI calling bots',
    tagline: 'Reusable voice personas with scripts and knowledge.',
    icon: 'bot',
    category: 'AI outreach',
    intro: [
      'AI Bots are the reusable personas that power your calling campaigns. Design a bot once — its voice, personality, objectives, and knowledge — then deploy it across many campaigns for consistent conversations.',
    ],
    sections: [
      {
        heading: 'What defines a bot',
        capabilities: [
          { title: 'Persona & objective', text: 'The bot’s role, tone, and the goal it drives every call toward.' },
          { title: 'Script & prompts', text: 'The opening, talking points, and objection handling it follows.' },
          { title: 'Knowledge', text: 'Reference material the bot can draw on, searchable so it answers accurately.' },
        ],
      },
      {
        heading: 'Creating and reusing bots',
        steps: [
          'Open AI Bots and create a new bot with its persona and script.',
          'Add any knowledge or reference documents you want it to use.',
          'Save it, then select it when configuring an AI Calling campaign.',
          'Iterate: refine the script and every future campaign using that bot inherits the improvement.',
        ],
      },
    ],
    tips: ['Test a bot in AI Chat before putting it on live calls — it’s the fastest way to feel out its tone and answers.'],
    related: ['ai-calling', 'ai-chat', 'settings'],
  },
  {
    slug: 'ai-chat',
    title: 'AI chat',
    tagline: 'Chat with your bots and draft outreach on demand.',
    icon: 'message',
    category: 'AI outreach',
    intro: [
      'AI Chat is a text playground for your AI bots. Use it to rehearse a bot’s conversation, pressure-test its answers, and draft or refine outreach copy without picking up the phone.',
    ],
    sections: [
      {
        heading: 'What you can do',
        capabilities: [
          { title: 'Rehearse a persona', text: 'Chat as if you were the prospect to hear how a bot responds and where its script needs work.' },
          { title: 'Draft copy', text: 'Ask for subject lines, openers, and follow-ups you can paste into templates.' },
          { title: 'Validate knowledge', text: 'Confirm a bot answers product and objection questions correctly before it goes live.' },
        ],
      },
      {
        heading: 'Using it',
        steps: [
          'Open AI Chat and select the bot you want to talk to.',
          'Send messages as the prospect would, and read the bot’s replies.',
          'Refine the bot’s script under AI Bots based on what you learn, then re-test.',
        ],
      },
    ],
    tips: ['Chat is the safe place to break a bot — try the hardest objections here so live calls go smoothly.'],
    related: ['ai-bots', 'ai-calling'],
  },

  // ─────────────────────────────── Configuration
  {
    slug: 'settings',
    title: 'Settings & credentials',
    tagline: 'Connect the services that power sending and calling.',
    icon: 'settings',
    category: 'Configuration',
    intro: [
      'Settings is where you connect the external services ReachConvert orchestrates. Credentials are stored encrypted, and each integration has a test button so you can verify a connection before you rely on it.',
    ],
    sections: [
      {
        heading: 'Integrations',
        capabilities: [
          { title: 'AWS SES', text: 'Powers email delivery. Add your access key, secret, region, and sender address, then Test SES.' },
          { title: 'Gemini (Live)', text: 'Powers AI calling and signal classification. Add and verify your Gemini API key.' },
          { title: 'Twilio', text: 'Places the actual phone calls. Add your account SID, auth token, and phone number.' },
          { title: 'Gemini (Text)', text: 'The same Gemini key backs AI text generation for templates. Pick a cheap text model such as gemini-2.5-flash-lite.' },
        ],
      },
      {
        heading: 'Verifying connections',
        steps: [
          'Enter credentials for a service.',
          'Click its Test button — a live check confirms the keys work.',
          'A connected status unlocks the related feature (e.g. Gemini “Connected” enables AI calling).',
        ],
      },
    ],
    tips: [
      'Mock/test AWS keys keep email in simulation mode — great for demos, and no mail actually leaves.',
      'Stored credentials are encrypted at rest and masked in the UI once saved.',
    ],
    related: ['email-campaigns', 'ai-calling', 'signals'],
  },
  {
    slug: 'profile',
    title: 'Profile & appearance',
    tagline: 'Your identity and the look of your workspace.',
    icon: 'user',
    category: 'Configuration',
    intro: [
      'Profile manages your account identity and the appearance of the entire app. Update your details, and personalize the workspace with a theme and accent color that apply everywhere instantly.',
    ],
    sections: [
      {
        heading: 'Account details',
        body: ['Edit your name, email, title, company, and phone. Your initials and details appear throughout the app, including the sidebar.'],
      },
      {
        heading: 'Themes & accents',
        capabilities: [
          { title: 'Theme families', text: 'Four dark themes (Midnight, Slate, Graphite, Violet) and four light themes (Cloud, Paper, Mint, Rose).' },
          { title: 'Accent colors', text: 'Indigo, Emerald, Sky, Rose, Amber, or Violet — recolors buttons, highlights, and charts.' },
          { title: 'Instant apply', text: 'Selections take effect immediately and persist to your profile.' },
        ],
      },
    ],
    tips: ['Use the quick light/dark toggle in the sidebar footer to flip modes without opening Profile.'],
    related: ['settings'],
  },
];

export function getDocBySlug(slug: string): DocPage | undefined {
  return DOC_PAGES.find((d) => d.slug === slug);
}

export function getDocsByCategory(): { category: string; docs: DocPage[] }[] {
  return DOC_CATEGORIES.map((category) => ({
    category,
    docs: DOC_PAGES.filter((d) => d.category === category),
  }));
}

/** Resolve a doc's `related` slugs into full pages (skips any that don't exist). */
export function getDocBySlugRelated(slug: string): DocPage[] {
  const doc = getDocBySlug(slug);
  if (!doc?.related) return [];
  return doc.related
    .map((s) => getDocBySlug(s))
    .filter((d): d is DocPage => !!d);
}
