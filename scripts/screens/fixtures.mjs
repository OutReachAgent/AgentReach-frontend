// Fictional workspace for the screenshot capture. Every company and person is
// invented and uses a reserved .example domain.

export const USER = {
  id: 'user_demo',
  email: 'maya@northwind.example',
  name: 'Maya Chen',
  initials: 'MC',
  title: 'Head of Growth',
  company: 'Northwind Labs',
  phone: '+1 415 555 0142',
  theme: 'dark-midnight',
  accentColor: 'sky',
  authProvider: 'local',
  emailVerified: true,
};

const MASK = '••••••••••••••••';
const at = (iso) => new Date(iso).toISOString();
const emailOf = (first, last, domain) => `${first}.${last}`.toLowerCase().replace(/'/g, '') + `@${domain}`;
const page = (items, searchParams) => {
  const limit = Number(searchParams.get('limit') || items.length || 1);
  const current = Number(searchParams.get('page') || 1);
  return {
    items: items.slice((current - 1) * limit, current * limit),
    total: items.length,
    page: current,
    limit,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  };
};

const SETTINGS = {
  id: 'settings_demo',
  userId: USER.id,
  awsAccessKeyId: MASK,
  awsSecretAccessKey: MASK,
  awsRegion: 'us-east-1',
  awsSenderEmail: 'maya@northwind.example',
  replyTrackingDomain: 'reply.northwind.example',
  replyTrackingTopicArn: 'arn:aws:sns:us-east-1:000000000000:reachconvert-replies',
  sesConfigurationSet: 'reachconvert-tracking',
  mailFromName: 'Maya Chen',
  mailSignature: 'Maya Chen\nHead of Growth, Northwind Labs',
  geminiApiKey: MASK,
  geminiTextModel: 'gemini-flash-lite-latest',
  twilioAccountSid: MASK,
  twilioAuthToken: MASK,
  twilioPhoneNumber: MASK,
  twilioStatus: 'CONNECTED',
  twilioLastVerified: at('2026-10-18T16:02:00Z'),
  geminiStatus: 'CONNECTED',
  geminiLastVerified: at('2026-10-18T16:03:00Z'),
  callProvider: 'twilio',
  plivoAuthId: '',
  plivoAuthToken: '',
  plivoPhoneNumber: '',
  plivoStatus: 'DISCONNECTED',
  hunterApiKey: MASK,
  hunterStatus: 'CONNECTED',
  hunterLastVerified: at('2026-10-18T16:04:00Z'),
};

const COMPANIES = {
  contoso: { name: 'Contoso Freight', domain: 'contoso.example' },
  fabrikam: { name: 'Fabrikam Retail', domain: 'fabrikam.example' },
  wwi: { name: 'Wide World Importers', domain: 'wideworldimporters.example' },
  tailspin: { name: 'Tailspin Logistics', domain: 'tailspin.example' },
  litware: { name: 'Litware Health', domain: 'litware.example' },
  adventure: { name: 'Adventure Works Cycles', domain: 'adventure-works.example' },
  proseware: { name: 'Proseware Supply', domain: 'proseware.example' },
  fourth: { name: 'Fourth Coffee', domain: 'fourthcoffee.example' },
  coho: { name: 'Coho Vineyard', domain: 'cohovineyard.example' },
  alpine: { name: 'Alpine Ski House', domain: 'alpineskihouse.example' },
};
const COMPANY_KEYS = Object.keys(COMPANIES);

const FIRST = ['Priya', 'Daniel', 'Sofia', 'Liam', 'Aisha', 'Kenji', 'Hannah', 'Ravi', 'Elena', 'Marcus', 'Chloe', 'Tom', 'Nadia', 'Arjun', 'Grace', 'Owen', 'Mateo', 'Ingrid', 'Samuel', 'Leila'];
const LAST = ['Raman', 'Okafor', 'Marquez', "O'Connell", 'Bello', 'Watanabe', 'Schmidt', 'Menon', 'Petrova', 'Lee', 'Dubois', 'Brennan', 'Haddad', 'Kapoor', 'Kim', 'Davies', 'Rossi', 'Lindqvist'];
const PEOPLE = [
  ['VP Operations', 'contoso', '+1 312 555 0110'],
  ['Head of Supply Chain', 'contoso', '+1 312 555 0111'],
  ['Director of Merchandising', 'fabrikam', '+1 646 555 0120'],
  ['COO', 'fabrikam', '+1 646 555 0121'],
  ['Head of Planning', 'wwi', '+1 206 555 0130'],
  ['Inventory Manager', 'wwi', '+1 206 555 0131'],
  ['VP Logistics', 'tailspin', '+1 512 555 0140'],
  ['Operations Director', 'tailspin', '+1 512 555 0141'],
  ['Procurement Lead', 'litware', '+1 617 555 0150'],
  ['Head of Ecommerce', 'adventure', '+1 303 555 0160'],
  ['Supply Planner', 'adventure', '+1 303 555 0161'],
  ['CFO', 'proseware', '+1 404 555 0170'],
  ['Director of Operations', 'fourth', '+1 503 555 0180'],
  ['Head of Retail Ops', 'fourth', '+1 503 555 0181'],
  ['General Manager', 'coho', '+1 707 555 0190'],
  ['Logistics Manager', 'alpine', '+1 970 555 0199'],
];

const makeContact = (first, last, jobTitle, key, phoneNumber, n) => ({
  id: `contact_${n}`,
  firstName: first,
  lastName: last,
  email: emailOf(first, last, COMPANIES[key].domain),
  company: COMPANIES[key].name,
  jobTitle,
  phoneNumber,
  directoryId: n <= 8 ? 'dir_retail' : 'dir_distributors',
});

const CONTACTS = PEOPLE.map(([jobTitle, key, phone], i) => makeContact(FIRST[i], LAST[i], jobTitle, key, phone, i + 1));

const DIRECTORIES = [
  { id: 'dir_retail', name: 'Retail ops leaders', contactCount: 360 },
  { id: 'dir_distributors', name: 'Distributors', contactCount: 340 },
  { id: 'dir_webinar', name: 'Q4 webinar list', contactCount: 418 },
  { id: 'dir_trial', name: 'Trial users', contactCount: 128 },
];

const TEMPLATES = [
  {
    id: 'tpl_retail_intro',
    name: 'Retail intro, short',
    subject: '{{firstName}}, a calmer peak season at {{company}}',
    bodyHtml:
      '<p>Hi {{firstName}},</p><p>Most retail ops teams we talk to plan peak inventory in spreadsheets that are out of date by the time they are shared. Northwind Labs forecasts demand per store and SKU every night, so {{company}} can reorder before shelves run low.</p><p>Would a 20-minute walkthrough next week be useful?</p><p>Maya</p>',
    bodyText: '',
    type: 'HTML',
    category: 'Outreach',
  },
  {
    id: 'tpl_webinar',
    name: 'Webinar invite v2',
    subject: 'Q4 demand planning, live in 30 minutes',
    bodyHtml: '<p>Hi {{firstName}},</p><p>Join our Q4 forecasting session on 23 October.</p>',
    bodyText: '',
    type: 'HTML',
    category: 'Events',
  },
  {
    id: 'tpl_case_study',
    name: 'Case study follow-up',
    subject: 'How a distributor cut stockouts by a third',
    bodyHtml: '<p>Hi {{firstName}},</p><p>Following up with the case study I mentioned.</p>',
    bodyText: '',
    type: 'HTML',
    category: 'Follow-up',
  },
  {
    id: 'tpl_trial',
    name: 'Trial check-in',
    subject: 'How is the trial going, {{firstName}}?',
    bodyHtml: '<p>Hi {{firstName}},</p><p>Checking in on your first week.</p>',
    bodyText: '',
    type: 'HTML',
    category: 'Customers',
  },
];
const [TPL_RETAIL, TPL_WEBINAR, TPL_CASE, TPL_TRIAL] = TEMPLATES;

const AI_DRAFT = {
  subject: '{{firstName}}, is peak planning still living in spreadsheets?',
  bodyHtml:
    '<p>Hi {{firstName}},</p><p>Teams like {{company}} usually rebuild the peak inventory plan every October, and it is out of date by November. Northwind Labs forecasts demand for every store and SKU overnight, so your planners start each morning from fresh numbers instead of last week’s sheet.</p><p>Would a 20-minute walkthrough next Thursday or Friday work for you?</p><p>Best,<br>Maya Chen<br>Head of Growth, Northwind Labs</p>',
  bodyText: '',
};
const AI_TEMPLATE = {
  id: 'tpl_ai_retail',
  name: 'AI HTML - Retail operations leaders',
  type: 'AI',
  category: 'AI Generated HTML',
  attachments: [],
  ...AI_DRAFT,
};

const ANALYTICS = {
  emailMetrics: { sent: 1184, delivered: 1184, failed: 10, openRate: 58.6, replyRate: 7.1 },
  callingMetrics: { callsMade: 236, successRate: 64, averageDuration: 94 },
  campaignPerformance: [
    { name: 'Q4 webinar invite', sent: 412, failed: 6, opens: 251, replies: 24 },
    { name: 'Retail ops intro', sent: 356, failed: 4, opens: 198, replies: 29 },
    { name: 'Distributor case study', sent: 288, failed: 0, opens: 151, replies: 17 },
    { name: 'Trial check-in', sent: 128, failed: 0, opens: 94, replies: 14 },
  ],
  templatePerformance: [
    { name: 'Webinar invite v2', sent: 412, openRate: 60.9, replyRate: 5.8 },
    { name: 'Retail intro, short', sent: 356, openRate: 55.6, replyRate: 8.1 },
    { name: 'Case study follow-up', sent: 288, openRate: 52.4, replyRate: 5.9 },
    { name: 'Trial check-in', sent: 128, openRate: 73.4, replyRate: 10.9 },
  ],
  segmentPerformance: [
    { segment: 'Contoso Freight', sent: 14, openRate: 71.4, replyRate: 14.3 },
    { segment: 'Fabrikam Retail', sent: 12, openRate: 58.3, replyRate: 8.3 },
    { segment: 'Wide World Importers', sent: 11, openRate: 63.6, replyRate: 9.1 },
    { segment: 'Tailspin Logistics', sent: 9, openRate: 55.6, replyRate: 11.1 },
    { segment: 'Adventure Works Cycles', sent: 8, openRate: 62.5, replyRate: 12.5 },
  ],
};

const rate = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);
const STAT_KEYS = ['contactCount', 'pendingCount', 'queuedCount', 'failedCount', 'sentCount', 'deliveredCount', 'bouncedCount', 'suppressedCount', 'unsubscribedCount', 'openedCount', 'repliedCount', 'openRate', 'replyRate'];
const stats = (contactCount, sentCount, openedCount, repliedCount, more = {}) => ({
  contactCount,
  pendingCount: 0,
  queuedCount: 0,
  failedCount: 0,
  sentCount,
  deliveredCount: sentCount,
  bouncedCount: 0,
  suppressedCount: 0,
  unsubscribedCount: 0,
  openedCount,
  repliedCount,
  openRate: rate(openedCount, sentCount),
  replyRate: rate(repliedCount, sentCount),
  ...more,
});
const emailCampaign = (id, name, status, createdAt, template, campaignStats, extra = {}) => ({
  id,
  name,
  status,
  createdAt: at(createdAt),
  scheduledAt: null,
  trackOpens: true,
  unsubscribeLink: true,
  sendRatePerHour: 120,
  fromEmail: 'maya@northwind.example',
  fromName: 'Maya Chen',
  cc: [],
  bcc: [],
  template: { id: template.id, name: template.name },
  ...campaignStats,
  ...extra,
});

const EMAIL_CAMPAIGNS = [
  emailCampaign('ec_holiday', 'Holiday peak readiness', 'SCHEDULED', '2026-10-19T15:00:00Z', TPL_RETAIL, stats(220, 0, 0, 0, { pendingCount: 220 }), {
    scheduledAt: at('2026-10-22T13:00:00Z'),
  }),
  emailCampaign('ec_recording', 'Webinar recording follow-up', 'SCHEDULED', '2026-10-20T12:00:00Z', TPL_WEBINAR, stats(167, 0, 0, 0, { pendingCount: 167 }), {
    scheduledAt: at('2026-10-24T14:30:00Z'),
  }),
  emailCampaign('ec_pricing', 'Distributor pricing update', 'SCHEDULED', '2026-10-20T13:00:00Z', TPL_CASE, stats(152, 0, 0, 0, { pendingCount: 152 }), {
    scheduledAt: at('2026-10-29T13:00:00Z'),
  }),
  emailCampaign('ec_case', 'Distributor case study', 'RUNNING', '2026-10-16T14:00:00Z', TPL_CASE, stats(340, 288, 151, 17, { queuedCount: 52 })),
  emailCampaign('ec_retail', 'Retail ops intro', 'COMPLETED', '2026-10-09T13:00:00Z', TPL_RETAIL, stats(360, 356, 198, 29, { bouncedCount: 3, failedCount: 1, unsubscribedCount: 2 })),
  emailCampaign('ec_webinar', 'Q4 webinar invite', 'COMPLETED', '2026-10-02T13:00:00Z', TPL_WEBINAR, stats(418, 412, 251, 24, { bouncedCount: 4, failedCount: 2 })),
  emailCampaign('ec_trial', 'Trial check-in', 'COMPLETED', '2026-09-26T13:00:00Z', TPL_TRIAL, stats(128, 128, 94, 14)),
];

// "Retail ops intro" recipients: the 16 named contacts first, then the rest of
// the 20 x 18 name grid, with statuses that add up to the campaign stats.
const RETAIL_REPLIES = {
  contact_1: ['Re: Priya, a calmer peak season at Contoso Freight', 'Timing is good, we are rebuilding our peak plan now. Can you do Thursday at 10?'],
  contact_5: ['Re: Aisha, a calmer peak season at Wide World Importers', 'Interested. Do you integrate with our WMS? Send over a few times.'],
  contact_10: ['Re: Marcus, a calmer peak season at Adventure Works Cycles', 'Looping in Chloe from planning. Next week works.'],
};
const retailRecipients = (() => {
  const recipients = [...CONTACTS];
  let n = CONTACTS.length;
  FIRST.forEach((first, a) =>
    LAST.forEach((last, b) => {
      if (a === b && a < CONTACTS.length) return;
      n += 1;
      const key = COMPANY_KEYS[n % COMPANY_KEYS.length];
      recipients.push(makeContact(first, last, 'Operations', key, `+1 555 010 ${String(n).padStart(4, '0')}`, n));
    }),
  );
  let opened = 0;
  let replied = 0;
  return recipients.map((contact, i) => {
    const bounced = [12, 200, 301].includes(i);
    const failed = i === 333;
    const reply = RETAIL_REPLIES[contact.id];
    const delivered = !bounced && !failed;
    const opens = delivered && opened < 198 && (reply || (i < 16 ? i % 3 !== 2 : (i * 7) % 10 < 6));
    if (opens) opened += 1;
    const replies = Boolean(reply) || (opens && i >= 16 && replied < 26 && i % 7 === 0);
    if (replies && !reply) replied += 1;
    const hour = 13 + Math.floor(i / 120);
    return {
      id: `ecc_${i + 1}`,
      contactId: contact.id,
      contact,
      deliveryStatus: bounced ? 'BOUNCED' : failed ? 'FAILED' : 'DELIVERED',
      openStatus: Boolean(opens),
      replyStatus: replies,
      firstOpenedAt: opens ? at(`2026-10-09T${String(hour + 2).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:00Z`) : null,
      repliedAt: replies ? at(`2026-10-10T${String(14 + (i % 4)).padStart(2, '0')}:40:00Z`) : null,
      replySubject: reply ? reply[0] : replies ? `Re: ${contact.firstName}, a calmer peak season at ${contact.company}` : null,
      replyText: reply ? reply[1] : replies ? 'Thanks, send me some times next week.' : null,
      sentTime: at(`2026-10-09T${String(hour).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00Z`),
      errorMessage: bounced ? 'Mailbox does not exist (550 5.1.1)' : failed ? 'Message rejected by the receiving server' : null,
      unsubscribedAt: [45, 120].includes(i) ? at('2026-10-11T09:00:00Z') : null,
      threadId: replies ? `thread_${contact.id}` : null,
    };
  });
})();

const emailCampaignDetail = (id) => {
  const found = EMAIL_CAMPAIGNS.find((item) => item.id === id);
  if (!found) return null;
  return {
    ...found,
    template: TEMPLATES.find((item) => item.id === found.template.id),
    contacts: id === 'ec_retail' ? retailRecipients : [],
    stats: Object.fromEntries(STAT_KEYS.map((key) => [key, found[key]])),
  };
};

const CALLING_CAMPAIGNS = [
  {
    id: 'cc_holiday',
    name: 'Holiday readiness check-in',
    status: 'SCHEDULED',
    objective: 'Confirm who owns peak-season planning and offer a forecast review before Black Friday.',
    contactCount: 66,
    scheduledAt: at('2026-10-23T14:00:00Z'),
    voice: 'Kore',
    language: 'en-US',
    createdAt: at('2026-10-19T16:00:00Z'),
  },
  {
    id: 'cc_trial',
    name: 'Trial users week-2 check-in',
    status: 'SCHEDULED',
    objective: 'Ask trial users how the first forecasts compare with their own plan and book an onboarding call.',
    contactCount: 38,
    scheduledAt: at('2026-10-27T15:00:00Z'),
    voice: 'Kore',
    language: 'en-US',
    createdAt: at('2026-10-20T10:00:00Z'),
  },
  {
    id: 'cc_demo',
    name: 'Ops leaders demo booking',
    status: 'COMPLETED',
    objective: 'Qualify interest in nightly demand forecasting and book a 20-minute demo with the operations lead.',
    contactCount: 96,
    scheduledAt: null,
    voice: 'Kore',
    language: 'en-US',
    createdAt: at('2026-10-14T15:00:00Z'),
  },
  {
    id: 'cc_webinar',
    name: 'Webinar no-show follow-up',
    status: 'COMPLETED',
    objective: 'Call registrants who missed the Q4 session, share the recording and offer a walkthrough.',
    contactCount: 74,
    scheduledAt: null,
    voice: 'Puck',
    language: 'en-US',
    createdAt: at('2026-10-06T15:00:00Z'),
  },
];

const PRIYA_TRANSCRIPT = [
  'AI: Hi Priya, this is Ava, an AI assistant calling on behalf of Northwind Labs. This call is recorded. Do you have a minute?',
  'User: Sure, I have a couple of minutes.',
  'AI: Thanks. We help retail and distribution teams forecast demand per store and SKU every night. How does Contoso plan inventory for peak season today?',
  'User: Mostly spreadsheets. We rebuild the plan every October and it is out of date by November.',
  'AI: That is the most common thing we hear. Would a 20-minute walkthrough with your operations team be useful? I can offer Thursday at 10 or Friday at 2 Central.',
  'User: Thursday at 10 works. Can Daniel from supply chain join?',
  'AI: Of course. I will send the invite to you and Daniel for Thursday at 10 Central. Anything you would like us to cover?',
  'User: Whether it connects to our warehouse system.',
  'AI: Noted, we will cover the WMS integration. Thanks Priya, have a good day.',
].join('\n');

const call = (id, contact, outcome, duration, startedAt, extra = {}) => ({
  id,
  contactId: contact.id,
  contact,
  outcome,
  duration,
  status: 'COMPLETED',
  sessionStatus: outcome === 'ANSWERED' ? 'completed' : 'not_connected',
  callType: 'phone_call',
  selectedVoice: 'Kore',
  selectedLanguage: 'en-US',
  recordingUrl: outcome === 'ANSWERED' ? `recordings/${id}.mp3` : null,
  startedAt: at(startedAt),
  totalTime: duration ? (duration + 6) * 1000 : null,
  startupTime: duration ? 1800 : null,
  ...extra,
});

const DEMO_CALLS = [
  call('call_1', CONTACTS[0], 'ANSWERED', 142, '2026-10-15T15:02:00Z', {
    analysis: { engagement_score: 86, intent: 'Interested, demo booked' },
    summary: 'Priya plans peak inventory in spreadsheets that go stale within weeks. She booked a demo for Thursday at 10:00 CT and asked for Daniel Okafor from supply chain to join.',
    keyOutcomes: 'Demo booked · Thursday 23 October, 10:00 CT · Invite Priya and Daniel · Cover the WMS integration',
    topicsCovered: ['Peak-season planning', 'Spreadsheet forecasting', 'WMS integration', 'Demo scheduling'],
    collectedData: { opportunityStatus: 'demo_booked', contactPerson: 'Priya Raman', email: 'priya.raman@contoso.example', demoTime: 'Thu 23 Oct, 10:00 CT', attendees: 'Priya Raman, Daniel Okafor' },
    transcript: PRIYA_TRANSCRIPT,
  }),
  call('call_2', CONTACTS[5], 'ANSWERED', 88, '2026-10-15T15:09:00Z', {
    analysis: { engagement_score: 61, intent: 'Callback requested' },
    summary: 'Kenji is mid-way through a stock count and asked for a call back next Tuesday morning.',
    keyOutcomes: 'Callback requested · Tuesday morning PT',
    topicsCovered: ['Callback'],
    collectedData: { callbackRequested: true, contactPerson: 'Kenji Watanabe' },
    transcript: 'AI: Hi Kenji, this is Ava, an AI assistant calling on behalf of Northwind Labs. This call is recorded. Is now a good time?\nUser: Not really, we are in the middle of a stock count.\nAI: No problem. When would be better?\nUser: Tuesday morning.\nAI: I will call back Tuesday morning. Thanks Kenji.',
  }),
  call('call_3', CONTACTS[6], 'NO_ANSWER', 0, '2026-10-15T15:14:00Z'),
  call('call_4', CONTACTS[9], 'ANSWERED', 63, '2026-10-15T15:21:00Z', {
    analysis: { engagement_score: 44, intent: 'Asked for an email' },
    summary: 'Marcus asked for details by email before booking time. Ava confirmed his address and offered next week.',
    keyOutcomes: 'Send overview email · Follow up next week',
    topicsCovered: ['Email follow-up'],
    collectedData: { email: 'marcus.lee@adventure-works.example' },
  }),
  call('call_5', CONTACTS[11], 'BUSY', 0, '2026-10-15T15:26:00Z'),
  call('call_6', CONTACTS[14], 'ANSWERED', 121, '2026-10-15T15:33:00Z', {
    analysis: { engagement_score: 72, intent: 'Interested, wants pricing' },
    summary: 'Grace runs planning for 40 stores and wants pricing for a pilot before involving her team.',
    keyOutcomes: 'Send pilot pricing · Follow up Friday',
    topicsCovered: ['Pricing', 'Pilot'],
    collectedData: { opportunityStatus: 'interested', contactPerson: 'Grace Kim' },
  }),
];

const callingCampaignDetail = (id) => {
  const found = CALLING_CAMPAIGNS.find((item) => item.id === id);
  if (!found) return null;
  return { ...found, calls: id === 'cc_demo' ? DEMO_CALLS : [] };
};

const BOTS = [
  {
    id: 'bot_ava',
    name: 'Ava, demo booking',
    description: 'Books 20-minute forecasting demos with retail and distribution operations leaders.',
    personality: 'warm, concise and direct; never pushy',
    botObjective: 'Confirm who owns peak-season planning and book a 20-minute demo with them.',
    botGoal: 'Book a demo, or capture the right owner and a good time to call back.',
    botFlow:
      'Say you are an AI assistant calling for Northwind Labs and that the call is recorded. Ask how they plan inventory for peak season. If they plan in spreadsheets, offer a 20-minute walkthrough with two time options. If they ask for an email, confirm the address and still offer a time. End politely if they are not interested.',
    knowledgeBaseText:
      'Northwind Labs forecasts demand per store and SKU every night from sales, promotions and weather data. Setup takes about two weeks. It connects to common warehouse management systems through a nightly export. Pilots cover up to 10 stores for 30 days.',
    contextOutsideKnowledgeBase: false,
    ragEnabled: true,
    status: 'READY',
    trainingChunkCount: 48,
    lastTrainedAt: at('2026-10-14T12:10:00Z'),
    language: 'en-US',
    voice: 'Kore',
    role: 'Sales development',
  },
  {
    id: 'bot_webinar',
    name: 'Webinar follow-up',
    description: 'Calls Q4 webinar no-shows, shares the recording and offers a walkthrough.',
    personality: 'friendly and brief',
    botObjective: 'Share the webinar recording and offer a walkthrough.',
    ragEnabled: true,
    status: 'READY',
    trainingChunkCount: 22,
    lastTrainedAt: at('2026-10-05T10:00:00Z'),
    language: 'en-US',
    voice: 'Puck',
  },
  {
    id: 'bot_trial',
    name: 'Trial reactivation',
    description: 'Checks in with trial users who went quiet and books an onboarding call.',
    personality: 'helpful and patient',
    botObjective: 'Find out why the trial stalled and book an onboarding call.',
    ragEnabled: true,
    status: 'READY',
    trainingChunkCount: 31,
    lastTrainedAt: at('2026-09-28T10:00:00Z'),
    language: 'en-US',
    voice: 'Kore',
  },
];

const SIGNAL_STATS = { watchedCompanies: 48, totalSignals: 37, triggeredOutreach: 22, triggered: { replyRate: 12.4 }, manual: { replyRate: 7.1 } };
const signal = (id, type, typeLabel, confidence, companyName, title, summary, occurredAt, matchedContacts, url, triggeredCount, pendingCount) => ({
  id, type, typeLabel, confidence, companyName, title, summary, occurredAt: at(occurredAt), matchedContacts, url, triggeredCount, pendingCount,
});
const SIGNALS = [
  signal('sig_1', 'funding', 'Funding round', 'high', 'Contoso Freight', 'Contoso Freight raises $40M Series C to expand its cross-dock network', 'The round funds three new regional hubs and a larger planning team ahead of next year’s peak season.', '2026-10-20T11:05:00Z', 2, 'https://news.example/contoso-freight-series-c', 2, 0),
  signal('sig_2', 'hiring-surge', 'Hiring surge', 'high', 'Fabrikam Retail', 'Fabrikam Retail is hiring 6 demand planners', 'Six planning roles posted in two weeks across Chicago and Columbus, all mentioning store-level forecasting.', '2026-10-19T16:40:00Z', 2, 'https://jobs.example/fabrikam-retail', 0, 2),
  signal('sig_3', 'product-launch', 'Product launch', 'medium', 'Wide World Importers', 'Wide World Importers launches same-day delivery in 12 cities', 'Same-day delivery raises the cost of a stockout, which usually brings forecasting up the agenda.', '2026-10-18T14:20:00Z', 2, 'https://news.example/wwi-same-day', 1, 0),
  signal('sig_4', 'company-news', 'Company news', 'medium', 'Tailspin Logistics', 'Tailspin Logistics opens a second fulfilment centre in Austin', 'The new site doubles capacity in Texas from January.', '2026-10-17T09:30:00Z', 2, 'https://news.example/tailspin-austin', 0, 1),
  signal('sig_5', 'job-change', 'Job change', 'medium', 'Litware Health', 'Elena Petrova may have left Litware Health', 'Her work address bounced on 17 October. Find the new procurement lead before the next send.', '2026-10-17T08:10:00Z', 1, null, 0, 0),
  signal('sig_6', 'funding', 'Funding round', 'high', 'Proseware Supply', 'Proseware Supply closes a $12M growth round', 'Funding earmarked for warehouse automation and two new distribution centres.', '2026-10-15T13:00:00Z', 1, 'https://news.example/proseware-growth', 1, 0),
];
const REVIEW_QUEUE = [
  {
    matchId: 'match_1',
    confidence: 'high',
    signal: { type: 'hiring-surge', typeLabel: 'Hiring surge', title: 'Fabrikam Retail is hiring 6 demand planners' },
    playbook: { name: 'Hiring surge, review first' },
    contact: { name: 'Sofia Marquez', jobTitle: 'Director of Merchandising', email: 'sofia.marquez@fabrikam.example', company: 'Fabrikam Retail' },
    preview: { subject: 'Six new planners at Fabrikam Retail', bodyText: 'Hi Sofia, congratulations on growing the planning team. Teams that hire several planners at once often want a shared forecast to start from. Worth a 20-minute look?' },
  },
  {
    matchId: 'match_2',
    confidence: 'high',
    signal: { type: 'hiring-surge', typeLabel: 'Hiring surge', title: 'Fabrikam Retail is hiring 6 demand planners' },
    playbook: { name: 'Hiring surge, review first' },
    contact: { name: "Liam O'Connell", jobTitle: 'COO', email: 'liam.oconnell@fabrikam.example', company: 'Fabrikam Retail' },
    preview: { subject: 'Planning team growth at Fabrikam Retail', bodyText: 'Hi Liam, I saw Fabrikam is adding six demand planners. We help new planners start from a nightly store-level forecast. Open to a short call?' },
  },
  {
    matchId: 'match_3',
    confidence: 'medium',
    signal: { type: 'company-news', typeLabel: 'Company news', title: 'Tailspin Logistics opens a second fulfilment centre in Austin' },
    playbook: { name: 'Launch or expansion, intro email' },
    contact: { name: 'Hannah Schmidt', jobTitle: 'VP Logistics', email: 'hannah.schmidt@tailspin.example', company: 'Tailspin Logistics' },
    preview: { subject: 'Congratulations on the Austin opening', bodyText: 'Hi Hannah, congratulations on the second Austin site. Splitting stock between two centres is where a nightly forecast helps most. Worth a 20-minute look?' },
  },
];
const WATCHES = COMPANY_KEYS.map((key, i) => ({
  id: `watch_${key}`,
  companyName: COMPANIES[key].name,
  domain: COMPANIES[key].domain,
  status: i === 8 ? 'paused' : 'active',
  sourcesEnabled: i % 2 ? ['news', 'jobs'] : ['news', 'jobs', 'filings'],
}));
const PLAYBOOKS = [
  { id: 'pb_funding', name: 'Funding round, intro email', mode: 'auto', active: true, signalTypes: ['funding'], dailyCap: 20, cooldownDays: 30 },
  { id: 'pb_hiring', name: 'Hiring surge, review first', mode: 'review', active: true, signalTypes: ['hiring-surge'], dailyCap: 10, cooldownDays: 21 },
  { id: 'pb_launch', name: 'Launch or expansion, intro email', mode: 'review', active: true, signalTypes: ['product-launch', 'company-news'], dailyCap: 8, cooldownDays: 30 },
  { id: 'pb_jobchange', name: 'Job change, find the new owner', mode: 'review', active: false, signalTypes: ['job-change'], dailyCap: 5, cooldownDays: 60 },
];

const PROSPECT_SEARCHES = [
  {
    id: 'ps_retail',
    description: 'Grocery and home goods retailers in the US Midwest with 50 to 500 stores that still plan peak inventory by hand',
    status: 'completed',
    stage: 'done',
    counts: { companies: 6, qualified: 4, people: 8, withEmail: 5, withPhone: 2 },
    maxCompanies: 25,
    peoplePerCompany: 4,
    createdAt: at('2026-10-17T15:20:00Z'),
    mode: 'icp',
    profile: {
      summary: 'Midwest grocery and home goods retailers with 50 to 500 stores',
      industries: ['Grocery retail', 'Home goods retail'],
      keywords: ['store replenishment', 'peak season', 'demand planning'],
      companySize: { min: 500, max: 20000 },
      locations: ['Illinois', 'Ohio', 'Michigan', 'Wisconsin', 'Indiana'],
      jobTitles: ['VP Supply Chain', 'Head of Inventory Planning', 'Director of Store Operations'],
      signals: ['Hiring demand planners', 'New store openings'],
      exclusions: ['Online-only marketplaces', 'Wholesale-only distributors'],
      exampleDomains: ['fabrikam.example'],
    },
  },
  {
    id: 'ps_distributors',
    description: 'Regional food distributors in Texas and Georgia',
    status: 'completed',
    stage: 'done',
    counts: { companies: 18, qualified: 6, people: 19, withEmail: 11, withPhone: 5 },
    maxCompanies: 20,
    peoplePerCompany: 3,
    createdAt: at('2026-10-08T12:00:00Z'),
    mode: 'icp',
    profile: { summary: 'Regional food distributors in Texas and Georgia', industries: [], keywords: [], companySize: {}, locations: [], jobTitles: [], signals: [], exclusions: [], exampleDomains: [] },
  },
];
// The page wraps evidence in quotes itself.
const criterion = (key, label, verdict, evidence, url) => ({ key, label, verdict, evidence: evidence.replace(/^“|”$/g, ''), url });
const PROSPECT_COMPANIES = [
  {
    id: 'pc_lakeshore',
    name: 'Lakeshore Market Co.',
    domain: 'lakeshoremarket.example',
    summary: 'Neighbourhood grocery chain with 180 stores across Illinois, Wisconsin and Michigan.',
    score: 94,
    status: 'qualified',
    emailPattern: '{first}.{last}',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'yes', '“Lakeshore Market Co. runs 180 neighbourhood grocery stores.”', 'https://lakeshoremarket.example/about'),
      criterion('size', '50 to 500 stores', 'yes', '“...180 neighbourhood grocery stores...”', 'https://lakeshoremarket.example/about'),
      criterion('location', 'US Midwest', 'yes', '“Stores in Illinois, Wisconsin and Michigan.”', 'https://lakeshoremarket.example/locations'),
      criterion('signal', 'Hiring demand planners', 'yes', '“Demand Planner, Store Replenishment (Chicago, IL)”', 'https://lakeshoremarket.example/careers'),
    ],
    phones: [{ value: '+1 312 555 0177', label: 'Head office', url: 'https://lakeshoremarket.example/contact', type: 'main' }],
  },
  {
    id: 'pc_prairie',
    name: 'Prairie Home Goods',
    domain: 'prairiehome.example',
    summary: 'Home goods and hardware retailer with 96 stores in Ohio and Indiana.',
    score: 88,
    status: 'qualified',
    emailPattern: '{first}{last}',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'yes', '“Home, garden and hardware for 96 communities.”', 'https://prairiehome.example/about'),
      criterion('size', '50 to 500 stores', 'yes', '“96 stores across Ohio and Indiana.”', 'https://prairiehome.example/stores'),
      criterion('location', 'US Midwest', 'yes', '“Headquartered in Dayton, Ohio.”', 'https://prairiehome.example/contact'),
      criterion('signal', 'New store openings', 'unknown', 'No mention of new stores on the pages read.', 'https://prairiehome.example/news'),
    ],
  },
  {
    id: 'pc_riverbend',
    name: 'Riverbend Grocers',
    domain: 'riverbendgrocers.example',
    summary: 'Family-owned grocery chain with 64 stores in Indiana and Michigan.',
    score: 83,
    status: 'qualified',
    emailPattern: '{f}{last}',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'yes', '“64 family-owned grocery stores since 1958.”', 'https://riverbendgrocers.example/our-story'),
      criterion('size', '50 to 500 stores', 'yes', '“...64 family-owned grocery stores...”', 'https://riverbendgrocers.example/our-story'),
      criterion('location', 'US Midwest', 'yes', '“Serving Indiana and Michigan.”', 'https://riverbendgrocers.example/stores'),
      criterion('signal', 'Hiring demand planners', 'yes', '“Inventory Planner (Fort Wayne, IN)”', 'https://riverbendgrocers.example/careers'),
    ],
  },
  {
    id: 'pc_maple',
    name: 'Maple & Main Hardware',
    domain: 'maplemain.example',
    summary: 'Hardware and home improvement retailer with 210 stores.',
    score: 71,
    status: 'qualified',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'yes', '“Hardware, paint and home improvement in 210 stores.”', 'https://maplemain.example/about'),
      criterion('size', '50 to 500 stores', 'yes', '“...210 stores...”', 'https://maplemain.example/about'),
      criterion('location', 'US Midwest', 'unknown', 'Store list loads in a map the reader could not open.', 'https://maplemain.example/stores'),
      criterion('signal', 'New store openings', 'yes', '“Now open: Rockford, IL and Green Bay, WI.”', 'https://maplemain.example/news'),
    ],
  },
  {
    id: 'pc_greatlakes',
    name: 'Great Lakes Pantry',
    domain: 'greatlakespantry.example',
    summary: 'Specialty grocer with 12 stores around Cleveland.',
    score: 41,
    status: 'rejected',
    reason: 'Runs 12 stores. Your profile asks for 50 to 500.',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'yes', '“Specialty groceries and prepared food.”', 'https://greatlakespantry.example/about'),
      criterion('size', '50 to 500 stores', 'no', '“Visit any of our 12 Cleveland-area stores.”', 'https://greatlakespantry.example/stores'),
    ],
  },
  {
    id: 'pc_heartland',
    name: 'Heartland Wholesale',
    domain: 'heartland-wholesale.example',
    summary: 'Supplies grocery products to independent retailers.',
    score: 32,
    status: 'rejected',
    reason: 'Sells wholesale to other retailers. Your profile excludes wholesale-only distributors.',
    criteria: [
      criterion('industry', 'Grocery or home goods retail', 'no', '“We supply more than 900 independent grocers.”', 'https://heartland-wholesale.example/about'),
      criterion('location', 'US Midwest', 'yes', '“Distribution centre in Des Moines, Iowa.”', 'https://heartland-wholesale.example/contact'),
    ],
  },
];
const prospect = (id, companyId, companyName, domain, firstName, lastName, jobTitle, email, score, reasons, status, sourceUrl) => ({
  id, companyId, companyName, domain, firstName, lastName, jobTitle, email, score, reasons, status, sourceUrl,
});
const PROSPECT_PEOPLE = [
  prospect('pp_1', 'pc_lakeshore', 'Lakeshore Market Co.', 'lakeshoremarket.example', 'Rachel', 'Nguyen', 'VP Supply Chain', 'rachel.nguyen@lakeshoremarket.example', 92, ['Owns replenishment for all 180 stores', 'Email published on the leadership page'], 'ready', 'https://lakeshoremarket.example/leadership'),
  prospect('pp_2', 'pc_lakeshore', 'Lakeshore Market Co.', 'lakeshoremarket.example', 'Victor', 'Alvarez', 'Director of Store Operations', undefined, 81, ['Named on the leadership page'], 'needs_email', 'https://lakeshoremarket.example/leadership'),
  prospect('pp_3', 'pc_prairie', 'Prairie Home Goods', 'prairiehome.example', 'Megan', 'Foster', 'Head of Inventory Planning', 'meganfoster@prairiehome.example', 89, ['Leads inventory planning', 'Email published in a press release'], 'ready', 'https://prairiehome.example/news/planning-team'),
  prospect('pp_4', 'pc_prairie', 'Prairie Home Goods', 'prairiehome.example', 'Isaac', 'Brown', 'COO', undefined, 77, ['Named on the about page'], 'needs_email', 'https://prairiehome.example/about'),
  { ...prospect('pp_5', 'pc_riverbend', 'Riverbend Grocers', 'riverbendgrocers.example', 'Ana', 'Sousa', 'Replenishment Manager', 'asousa@riverbendgrocers.example', 86, ['Runs replenishment for all 64 stores', 'Email and phone published on the careers page'], 'ready', 'https://riverbendgrocers.example/careers'), phone: '+1 260 555 0144', phoneType: 'direct' },
  prospect('pp_6', 'pc_riverbend', 'Riverbend Grocers', 'riverbendgrocers.example', 'Ben', 'Carter', 'VP Operations', undefined, 79, ['Named on the leadership page'], 'needs_email', 'https://riverbendgrocers.example/leadership'),
  prospect('pp_7', 'pc_maple', 'Maple & Main Hardware', 'maplemain.example', 'Laura', 'Chen', 'Director of Supply Chain', 'laura.chen@maplemain.example', 74, ['Leads supply chain', 'Email published in the press kit'], 'ready', 'https://maplemain.example/press'),
  { ...prospect('pp_8', 'pc_maple', 'Maple & Main Hardware', 'maplemain.example', 'Hugo', 'Martins', 'Inventory Analyst', 'hugo.martins@maplemain.example', 68, ['Works on store inventory', 'Email and phone published on the news page'], 'ready', 'https://maplemain.example/news'), phone: '+1 815 555 0163', phoneType: 'direct' },
];

const HUNTER_ACCOUNT = {
  planName: 'Starter',
  resetDate: '2026-11-01',
  searches: { used: 38, available: 500, remaining: 462 },
  verifications: { used: 61, available: 1000, remaining: 939 },
};
const hunterPerson = (firstName, lastName, position, seniority, department, confidence, verificationStatus, alreadyInContacts = false) => ({
  email: emailOf(firstName, lastName, 'fabrikam.example'),
  firstName,
  lastName,
  position,
  seniority,
  department,
  linkedinUrl: '',
  phoneNumber: '',
  company: 'Fabrikam Retail',
  domain: 'fabrikam.example',
  type: 'personal',
  confidence,
  verificationStatus,
  sourceUrl: 'https://fabrikam.example/leadership',
  alreadyInContacts,
});
const FABRIKAM_PEOPLE = [
  hunterPerson('Mina', 'Patel', 'Head of Store Operations', 'executive', 'operations', 96, 'valid'),
  hunterPerson('Carlos', 'Mendes', 'Replenishment Manager', 'senior', 'operations', 93, 'valid'),
  hunterPerson('Jordan', 'Blake', 'Supply Chain Analyst', 'junior', 'operations', 88, 'accept_all'),
  hunterPerson('Sofia', 'Marquez', 'Director of Merchandising', 'executive', 'management', 97, 'valid', true),
  hunterPerson('Liam', "O'Connell", 'COO', 'executive', 'management', 95, 'valid', true),
  hunterPerson('Erin', 'Walsh', 'VP Finance', 'executive', 'finance', 86, 'valid'),
  hunterPerson('Kofi', 'Mensah', 'Logistics Coordinator', 'junior', 'operations', 74, 'unknown'),
];
const HUNTER_SEARCH = { domain: 'fabrikam.example', company: 'Fabrikam Retail', pattern: '{first}.{last}', people: FABRIKAM_PEOPLE, total: 14, limit: 10, offset: 0 };

const MAIL_COUNTS = { inbox: 6, campaigns: 29, drafts: 2, scheduled: 1 };
const MAIL_SENDERS = {
  defaultFrom: 'maya@northwind.example',
  fromName: 'Maya Chen',
  signature: 'Maya Chen\nHead of Growth, Northwind Labs',
  addresses: ['maya@northwind.example'],
  domains: ['northwind.example'],
  sesConfigured: true,
  replyTrackingActive: true,
};
const CAMPAIGN_REF = Object.fromEntries(EMAIL_CAMPAIGNS.map((item) => [item.id, { id: item.id, name: item.name }]));
const replyThread = (contact, campaignId, subject, reply, receivedAt, unread) => ({
  id: `thread_${contact.id}`,
  subject,
  snippet: reply,
  participants: [{ email: contact.email, name: `${contact.firstName} ${contact.lastName}` }, { email: USER.email, name: USER.name }],
  lastMessageAt: at(receivedAt),
  lastActivityAt: at(receivedAt),
  messageCount: 2,
  unreadCount: unread ? 1 : 0,
  hasInbound: true,
  draftCount: 0,
  scheduledCount: 0,
  hasAttachments: false,
  starred: contact.id === 'contact_1',
  archived: false,
  trashed: false,
  labels: [],
  lastDirection: 'INBOUND',
  lastStatus: 'RECEIVED',
  contactId: contact.id,
  campaign: CAMPAIGN_REF[campaignId],
});
const MAIL_THREADS = [
  replyThread(CONTACTS[0], 'ec_retail', 'Re: Priya, a calmer peak season at Contoso Freight', RETAIL_REPLIES.contact_1[1], '2026-10-20T13:40:00Z', true),
  replyThread(CONTACTS[14], 'ec_trial', 'Re: How is the trial going, Grace?', 'Going well so far. Can we add two more stores to the pilot?', '2026-10-20T11:15:00Z', true),
  replyThread(CONTACTS[4], 'ec_retail', 'Re: Aisha, a calmer peak season at Wide World Importers', RETAIL_REPLIES.contact_5[1], '2026-10-19T17:05:00Z', false),
  replyThread(CONTACTS[6], 'ec_webinar', 'Re: Q4 demand planning, live in 30 minutes', 'Sorry I missed it. Is there a recording?', '2026-10-18T15:30:00Z', false),
  replyThread(CONTACTS[9], 'ec_retail', 'Re: Marcus, a calmer peak season at Adventure Works Cycles', RETAIL_REPLIES.contact_10[1], '2026-10-17T10:20:00Z', false),
  replyThread(CONTACTS[15], 'ec_case', 'Re: How a distributor cut stockouts by a third', 'Interesting numbers. What did the rollout look like?', '2026-10-16T19:45:00Z', false),
];
const mailMessage = (thread, direction, from, to, html, at_) => ({
  id: `${thread.id}_${direction.toLowerCase()}`,
  threadId: thread.id,
  direction,
  source: direction === 'OUTBOUND' ? 'CAMPAIGN' : null,
  status: direction === 'OUTBOUND' ? 'SENT' : 'RECEIVED',
  from,
  to: [to],
  cc: [],
  bcc: [],
  subject: direction === 'OUTBOUND' ? thread.subject.replace(/^Re: /, '') : thread.subject,
  html,
  text: html.replace(/<[^>]+>/g, ' '),
  quotedHtml: '',
  quotedText: '',
  snippet: html.replace(/<[^>]+>/g, ' ').slice(0, 120),
  attachments: [],
  scheduled: false,
  sentAt: direction === 'OUTBOUND' ? at_ : null,
  receivedAt: direction === 'INBOUND' ? at_ : null,
  readAt: null,
  trackOpens: true,
  openCount: direction === 'OUTBOUND' ? 3 : 0,
  firstOpenedAt: direction === 'OUTBOUND' ? at('2026-10-09T15:12:00Z') : null,
  lastOpenedAt: direction === 'OUTBOUND' ? at('2026-10-20T12:58:00Z') : null,
  deliveredAt: direction === 'OUTBOUND' ? at_ : null,
  automated: false,
  campaignId: direction === 'OUTBOUND' ? thread.campaign?.id ?? null : null,
  createdAt: at_,
  updatedAt: at_,
});
const threadDetail = (id) => {
  const thread = MAIL_THREADS.find((item) => item.id === id);
  if (!thread) return null;
  const contact = CONTACTS.find((item) => item.id === thread.contactId);
  const sender = { email: USER.email, name: USER.name };
  const recipient = { email: contact.email, name: `${contact.firstName} ${contact.lastName}` };
  const first = contact.firstName;
  return {
    ...thread,
    contact: { id: contact.id, firstName: contact.firstName, lastName: contact.lastName, email: contact.email, company: contact.company, jobTitle: contact.jobTitle },
    messages: [
      mailMessage(thread, 'OUTBOUND', sender, recipient, `<p>Hi ${first},</p><p>Most retail ops teams we talk to plan peak inventory in spreadsheets that are out of date by the time they are shared. Northwind Labs forecasts demand per store and SKU every night, so ${contact.company} can reorder before shelves run low.</p><p>Would a 20-minute walkthrough next week be useful?</p><p>Maya</p>`, at('2026-10-09T13:00:00Z')),
      mailMessage(thread, 'INBOUND', recipient, sender, `<p>Hi Maya,</p><p>${thread.snippet}</p><p>${first}</p>`, thread.lastMessageAt),
    ],
  };
};
const contactContext = (email) => {
  const contact = CONTACTS.find((item) => item.email === email);
  if (!contact) return { contact: null, campaigns: [], calls: [] };
  const calls = DEMO_CALLS.filter((item) => item.contactId === contact.id).map((item) => ({
    id: item.id,
    outcome: item.outcome,
    duration: item.duration,
    timestamp: item.startedAt,
    summary: item.summary,
  }));
  return {
    contact: { ...contact, linkedinUrl: '', notes: '' },
    campaigns: [{ id: 'ec_retail', name: 'Retail ops intro', status: 'COMPLETED', deliveryStatus: 'DELIVERED', sentTime: at('2026-10-09T13:00:00Z'), opened: true, replied: true }],
    calls,
  };
};

const AI_MODELS = {
  models: [
    { value: 'gemini-flash-lite-latest', label: 'Flash-Lite latest (auto-updates)' },
    { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
    { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
    { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  ],
  defaultModel: 'gemini-flash-lite-latest',
  reasoningEfforts: [
    { value: 'low', label: 'Low', description: 'Fast answers and simple lookups' },
    { value: 'medium', label: 'Medium', description: 'Normal multi-step work' },
    { value: 'high', label: 'High', description: 'Deep research and orchestration' },
  ],
};
const aiThread = (id, title, lastMessageAt) => ({
  id,
  title,
  model: 'gemini-3.8-flash',
  reasoningEffort: 'medium',
  status: 'idle',
  hasPendingAction: false,
  pendingAction: null,
  lastMessageAt: at(lastMessageAt),
  createdAt: at(lastMessageAt),
  updatedAt: at(lastMessageAt),
});
const AI_THREADS = [
  aiThread('t_fabrikam', 'Fabrikam ops contacts', '2026-10-20T13:58:00Z'),
  aiThread('t_signals', 'Signals worth acting on this week', '2026-10-20T09:12:00Z'),
  aiThread('t_replies', 'Unread replies summary', '2026-10-19T16:30:00Z'),
  aiThread('t_webinar', 'Draft webinar follow-up email', '2026-10-17T11:05:00Z'),
];
const aiThreadDetail = (id) => {
  const thread = AI_THREADS.find((item) => item.id === id);
  if (!thread) return null;
  const message = (n, role, content, extra = {}) => ({ id: `${id}_${n}`, threadId: id, role, content, createdAt: thread.lastMessageAt, ...extra });
  return {
    ...thread,
    messages: [
      message(1, 'user', 'Find operations people at fabrikam.example and save them to a list called Fabrikam ops'),
      message(2, 'tool', '', {
        toolName: 'find_contacts',
        toolResult: { ...HUNTER_SEARCH, people: FABRIKAM_PEOPLE.filter((person) => !person.alreadyInContacts), excludedExistingContacts: 2 },
      }),
      message(
        3,
        'assistant',
        'I found **5 people** at Fabrikam Retail who are not in your contacts yet. Sofia Marquez and Liam O’Connell are already saved, so I left them out.\n\nMina, Carlos and Erin have verified addresses. Jordan’s domain accepts all mail, so delivery is not guaranteed, and Kofi’s address could not be checked. Pick who to keep and I’ll add them to **Fabrikam ops**.',
      ),
    ],
  };
};

const ROUTES = [
  ['GET', /^\/api\/auth\/me$/, () => USER],
  ['GET', /^\/api\/settings$/, () => SETTINGS],
  ['GET', /^\/api\/analytics$/, () => ANALYTICS],
  ['GET', /^\/api\/templates$/, () => TEMPLATES],
  ['POST', /^\/api\/templates$/, () => AI_TEMPLATE],
  ['POST', /^\/api\/templates\/generate-jobs$/, () => ({ id: 'job_ai', status: 'PROCESSING' })],
  ['GET', /^\/api\/templates\/generate-jobs\/([^/]+)$/, ({ match }) => ({ id: match[1], status: 'COMPLETED', result: AI_DRAFT })],
  ['GET', /^\/api\/contacts$/, () => CONTACTS],
  ['GET', /^\/api\/contacts\/directories$/, () => DIRECTORIES],
  ['GET', /^\/api\/email-campaigns$/, ({ searchParams }) => (searchParams.has('page') ? page(EMAIL_CAMPAIGNS, searchParams) : EMAIL_CAMPAIGNS)],
  ['GET', /^\/api\/email-campaigns\/([^/]+)$/, ({ match }) => emailCampaignDetail(match[1])],
  ['GET', /^\/api\/calling-campaigns$/, ({ searchParams }) => (searchParams.has('page') ? page(CALLING_CAMPAIGNS, searchParams) : CALLING_CAMPAIGNS)],
  ['GET', /^\/api\/calling-campaigns\/([^/]+)$/, ({ match }) => callingCampaignDetail(match[1])],
  ['GET', /^\/api\/ai-calling-bots$/, () => BOTS],
  ['GET', /^\/api\/signals\/stats$/, () => SIGNAL_STATS],
  ['GET', /^\/api\/signals$/, () => SIGNALS],
  ['GET', /^\/api\/signals\/review-queue$/, () => REVIEW_QUEUE],
  ['GET', /^\/api\/signals\/watches$/, () => WATCHES],
  ['GET', /^\/api\/signals\/playbooks$/, () => PLAYBOOKS],
  ['GET', /^\/api\/prospects\/searches$/, () => PROSPECT_SEARCHES],
  ['GET', /^\/api\/prospects\/searches\/([^/]+)\/companies$/, ({ match }) => (match[1] === 'ps_retail' ? PROSPECT_COMPANIES : [])],
  ['GET', /^\/api\/prospects\/searches\/([^/]+)\/people$/, ({ match }) => (match[1] === 'ps_retail' ? PROSPECT_PEOPLE : [])],
  ['GET', /^\/api\/contact-finder\/account$/, () => HUNTER_ACCOUNT],
  ['POST', /^\/api\/contact-finder\/search$/, () => HUNTER_SEARCH],
  ['GET', /^\/api\/mail\/counts$/, () => MAIL_COUNTS],
  ['GET', /^\/api\/mail\/senders$/, () => MAIL_SENDERS],
  ['GET', /^\/api\/mail\/threads$/, ({ searchParams }) => page(searchParams.get('folder') === 'campaigns' ? MAIL_THREADS : MAIL_THREADS.slice(0, 2), searchParams)],
  ['GET', /^\/api\/mail\/threads\/([^/]+)$/, ({ match }) => threadDetail(match[1])],
  ['PATCH', /^\/api\/mail\/threads\/([^/]+)$/, ({ match }) => MAIL_THREADS.find((item) => item.id === match[1]) ?? null],
  ['GET', /^\/api\/mail\/contact-context$/, ({ searchParams }) => contactContext(searchParams.get('email'))],
  ['GET', /^\/api\/ai-chat\/models$/, () => AI_MODELS],
  ['GET', /^\/api\/ai-chat\/threads$/, () => AI_THREADS],
  ['GET', /^\/api\/ai-chat\/threads\/([^/]+)$/, ({ match }) => aiThreadDetail(match[1])],
];

export function findFixture(method, pathname, searchParams, body) {
  for (const [routeMethod, pattern, respond] of ROUTES) {
    if (routeMethod !== method) continue;
    const match = pathname.match(pattern);
    if (!match) continue;
    const result = respond({ match, searchParams, body });
    return result === null ? { status: 404, body: { message: 'Not found' } } : { body: result };
  }
  return null;
}
