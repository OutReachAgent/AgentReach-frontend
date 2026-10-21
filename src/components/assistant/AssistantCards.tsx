'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  PhoneCall,
  Radio,
  ShieldCheck,
  Telescope,
  UserPlus,
  UserSearch,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AiChatMessage, ContactFinderSavePerson, LooseApiResponse } from '@/lib/api';

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function valueOf(record: JsonRecord | null | undefined, key: string): string {
  const value = record?.[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function records(value: unknown) {
  return asArray(value).map(asRecord).filter((item): item is JsonRecord => !!item);
}

const TOOL_LABELS: Record<string, string> = {
  get_workspace_data: 'Workspace lookup',
  get_signal_insights: 'Signal insights',
  find_hiring_companies: 'Prospect Finder search',
  find_contacts: 'Contact Finder search',
  save_contacts: 'Saving contacts',
  prepare_email_campaign: 'Email campaign draft',
  prepare_calling_campaign: 'Calling campaign draft',
  prepare_signal_action: 'Signal action preview',
};

const AREA_LABELS: Record<string, string> = {
  dashboard: 'dashboard metrics',
  contacts: 'contacts',
  campaigns: 'campaigns',
  inbox: 'inbox',
  signals: 'Signals',
  history: 'outreach history',
  calling_agents: 'calling agents',
  prospects: 'Prospect Finder searches',
  scheduler: 'scheduled campaigns',
  profile: 'profile',
  integrations: 'integrations',
};

export function toolLabel(name?: string | null) {
  if (!name) return 'Workspace step';
  return TOOL_LABELS[name] || name.replaceAll('_', ' ').replace(/^\w/, (char) => char.toUpperCase());
}

/** A plain-language progress line for a tool call, using its arguments. */
export function describeTool(name: string, args: JsonRecord) {
  switch (name) {
    case 'get_workspace_data': {
      const area = valueOf(args, 'area') || 'dashboard';
      const query = valueOf(args, 'query');
      return `Reading your ${AREA_LABELS[area] || area}${query ? ` for “${query}”` : ''}`;
    }
    case 'get_signal_insights':
      return `Reviewing ${valueOf(args, 'type') ? `${valueOf(args, 'type')} ` : ''}Signals`;
    case 'find_hiring_companies':
      return 'Finding matching companies with Prospect Finder · about a minute';
    case 'find_contacts':
      return `Searching Hunter for people at ${valueOf(args, 'domain') || valueOf(args, 'company') || 'the company'} · uses 1 Hunter search`;
    case 'save_contacts': {
      const count = asArray(args.emails).length;
      const directory = valueOf(args, 'directoryName');
      return `Saving ${count || ''} contact${count === 1 ? '' : 's'}${directory ? ` to “${directory}”` : ''}`.replace('  ', ' ');
    }
    case 'prepare_email_campaign':
      return `Drafting the email campaign “${valueOf(args, 'name') || 'Outreach'}”`;
    case 'prepare_calling_campaign':
      return `Drafting the calling campaign “${valueOf(args, 'name') || 'Outreach'}”`;
    case 'prepare_signal_action':
      return `Preparing to ${valueOf(args, 'action') || 'review'} a Signal action`;
    default:
      return toolLabel(name);
  }
}

const RISKY = new Set(['invalid', 'disposable']);
const VERIFICATION_LABELS: Record<string, string> = {
  valid: 'Verified',
  accept_all: 'Accept-all',
  unknown: 'Unverified',
  invalid: 'Invalid',
  webmail: 'Webmail',
  disposable: 'Disposable',
};
const VERIFICATION_STYLES: Record<string, string> = {
  valid: 'bg-emerald-500/10 text-emerald-300',
  accept_all: 'bg-amber-500/10 text-amber-300',
  invalid: 'bg-rose-500/10 text-rose-300',
  disposable: 'bg-rose-500/10 text-rose-300',
};
const PREVIEW_ROWS = 6;

const CARD = 'rounded-2xl border p-4 sm:p-5';
const CARD_LABEL = 'flex items-center gap-2 text-xs font-bold uppercase tracking-wider';
const PRIMARY_BUTTON =
  'flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300';
const LINK_BUTTON = 'flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-100';

function confidenceStyle(score: number) {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-300';
  if (score >= 50) return 'bg-amber-500/10 text-amber-300';
  return 'bg-zinc-700/40 text-zinc-400';
}

function personName(person: JsonRecord) {
  return `${valueOf(person, 'firstName')} ${valueOf(person, 'lastName')}`.trim();
}

function toSavePerson(person: JsonRecord): ContactFinderSavePerson {
  return {
    email: valueOf(person, 'email'),
    firstName: valueOf(person, 'firstName'),
    lastName: valueOf(person, 'lastName') || undefined,
    position: valueOf(person, 'position') || undefined,
    company: valueOf(person, 'company') || undefined,
    linkedinUrl: valueOf(person, 'linkedinUrl') || undefined,
    phoneNumber: valueOf(person, 'phoneNumber') || undefined,
    confidence: typeof person.confidence === 'number' ? person.confidence : undefined,
    verificationStatus: valueOf(person, 'verificationStatus') || undefined,
    sourceUrl: valueOf(person, 'sourceUrl') || undefined,
  };
}

function toggle(set: Set<string>, key: string) {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

function DirectorySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { data: directories } = useQuery({
    queryKey: ['contact-directories'],
    queryFn: api.contacts.directories.list,
  });
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Contact list"
      className="max-w-[11rem] rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/60"
    >
      <option value="">No list</option>
      {(Array.isArray(directories) ? directories : []).map((directory: LooseApiResponse) => (
        <option key={directory.id} value={directory.id}>
          {directory.name}
        </option>
      ))}
    </select>
  );
}

export function ToolArtifact({ message, onPrompt }: { message: AiChatMessage; onPrompt: (prompt: string) => void }) {
  const result = message.toolResult || {};
  if (typeof result.error === 'string') return <ToolErrorCard name={message.toolName} error={result.error} />;
  switch (message.toolName) {
    case 'prepare_email_campaign':
    case 'prepare_calling_campaign':
      return <CampaignPreviewCard result={result} calling={message.toolName === 'prepare_calling_campaign'} />;
    case 'prepare_signal_action':
      return <SignalReviewCard result={result} />;
    case 'find_contacts':
      return <ContactResultsCard result={result} />;
    case 'save_contacts':
      return <SavedContactsCard result={result} />;
    case 'find_hiring_companies':
      return <ProspectResultsCard result={result} />;
  }
  if (message.toolName === 'get_signal_insights' || (message.toolName === 'get_workspace_data' && asRecord(result)?.stats && asRecord(result)?.feed)) {
    return <SignalInsightsCard result={result} onPrompt={onPrompt} />;
  }
  return null;
}

function ToolErrorCard({ name, error }: { name?: string | null; error: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-rose-300" />
      <div className="min-w-0 text-xs leading-5">
        <p className="font-semibold text-rose-200">{toolLabel(name)} didn&apos;t finish</p>
        <p className="mt-0.5 text-zinc-400">{error}</p>
        {/settings/i.test(error) && (
          <Link href="/settings" className="mt-1.5 inline-flex items-center gap-1 font-semibold text-rose-200 hover:text-white">
            Open Settings <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function ContactResultsCard({ result }: { result: JsonRecord }) {
  const queryClient = useQueryClient();
  const people = records(result.people);
  const company = valueOf(result, 'company') || valueOf(result, 'domain');
  const domain = valueOf(result, 'domain');
  const pattern = valueOf(result, 'pattern');
  const excluded = Number(result.excludedExistingContacts) || 0;
  const savable = (person: JsonRecord) => Boolean(valueOf(person, 'email') && valueOf(person, 'firstName'));
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(people.filter((person) => savable(person) && !RISKY.has(valueOf(person, 'verificationStatus'))).map((person) => valueOf(person, 'email'))),
  );
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [directoryId, setDirectoryId] = useState('');
  const [notice, setNotice] = useState('');

  const mutation = useMutation({
    mutationFn: (selected: JsonRecord[]) =>
      api.contactFinder.save({
        people: selected.map(toSavePerson),
        directoryId: directoryId || undefined,
        duplicateStrategy: 'SKIP',
      }),
    onSuccess: (res, selected) => {
      setSaved((current) => new Set([...current, ...selected.map((person) => valueOf(person, 'email'))]));
      setPicked(new Set());
      setNotice(`${res.added} added${res.skipped ? ` · ${res.skipped} skipped` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-directories'] });
    },
    onError: (err: Error) => setNotice(err.message || 'Could not save these contacts.'),
  });

  const selected = people.filter((person) => picked.has(valueOf(person, 'email')) && !saved.has(valueOf(person, 'email')));
  const visible = showAll ? people : people.slice(0, PREVIEW_ROWS);

  return (
    <div className={`${CARD} border-indigo-500/20 bg-indigo-500/4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className={`${CARD_LABEL} text-indigo-300`}>
            <UserSearch className="h-4 w-4" /> Contact Finder
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">
            {people.length ? `${people.length} new ${people.length === 1 ? 'person' : 'people'}` : 'No new people'}
            {company ? ` at ${company}` : ''}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {[excluded ? `${excluded} already in Contacts` : '', pattern && domain ? `Email format ${pattern}@${domain}` : '']
              .filter(Boolean)
              .join(' · ') || 'Results from Hunter.io'}
          </p>
        </div>
        <Link href="/contact-finder" className={LINK_BUTTON}>
          Contact Finder <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {people.length > 0 && (
        <div className="mt-3 divide-y divide-zinc-850 overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950/50">
          {visible.map((person) => {
            const email = valueOf(person, 'email');
            const status = valueOf(person, 'verificationStatus') || 'unknown';
            const confidence = Number(person.confidence) || 0;
            const isSaved = saved.has(email);
            return (
              <label key={email} className={`flex items-start gap-3 px-3 py-2.5 text-xs ${savable(person) && !isSaved ? 'cursor-pointer hover:bg-zinc-900/60' : 'opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={picked.has(email) && !isSaved}
                  disabled={!savable(person) || isSaved}
                  onChange={() => setPicked((current) => toggle(current, email))}
                  className="mt-0.5 h-3.5 w-3.5 flex-none rounded border-zinc-700 bg-zinc-950 accent-indigo-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-zinc-100">{personName(person) || 'Name not listed'}</span>
                  <span className="block truncate text-zinc-500">{valueOf(person, 'position') || '—'}</span>
                  <span className="block break-all text-zinc-400">{email}</span>
                </span>
                <span className="flex flex-none flex-col items-end gap-1">
                  {isSaved ? (
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <Check className="h-3 w-3" /> Saved
                    </span>
                  ) : (
                    <>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${confidenceStyle(confidence)}`}>{confidence}%</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${VERIFICATION_STYLES[status] || 'bg-zinc-700/40 text-zinc-400'}`}>
                        {VERIFICATION_LABELS[status] || status}
                      </span>
                    </>
                  )}
                </span>
              </label>
            );
          })}
          {people.length > PREVIEW_ROWS && (
            <button onClick={() => setShowAll((current) => !current)} className="w-full px-3 py-2 text-left text-[11px] font-semibold text-zinc-500 hover:text-zinc-200">
              {showAll ? 'Show fewer' : `Show all ${people.length}`}
            </button>
          )}
        </div>
      )}

      {people.some((person) => RISKY.has(valueOf(person, 'verificationStatus'))) && (
        <p className="mt-2 text-[11px] text-amber-300/80">Invalid or disposable addresses are not selected; they would bounce.</p>
      )}

      {people.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-500">{notice || `${selected.length} selected`}</span>
          <div className="flex items-center gap-2">
            <DirectorySelect value={directoryId} onChange={setDirectoryId} />
            <button onClick={() => mutation.mutate(selected)} disabled={!selected.length || mutation.isPending} className={PRIMARY_BUTTON}>
              {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Save {selected.length || ''} to Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedContactsCard({ result }: { result: JsonRecord }) {
  const added = Number(result.added) || 0;
  const updated = Number(result.updated) || 0;
  const existing = Number(result.existingContactsSkipped) || 0;
  const withoutName = asArray(result.withoutName).length;
  const notFound = asArray(result.notFound).map(String);
  const directory = asRecord(result.directory);
  const contacts = records(result.contacts);
  const details = [
    updated ? `${updated} updated` : '',
    existing ? `${existing} already in Contacts` : '',
    withoutName ? `${withoutName} without a name (add one in Contact Finder)` : '',
    notFound.length ? `${notFound.length} not found in this conversation` : '',
  ].filter(Boolean);
  return (
    <div className={`${CARD} border-emerald-500/20 bg-emerald-500/4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className={`${CARD_LABEL} text-emerald-300`}>
            <Users className="h-4 w-4" /> Contacts saved
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">
            {added} new contact{added === 1 ? '' : 's'}
            {directory ? ` in “${valueOf(directory, 'name')}”` : ''}
          </p>
          {details.length > 0 && <p className="mt-0.5 text-[11px] text-zinc-500">{details.join(' · ')}</p>}
        </div>
        <Link href="/contacts" className={LINK_BUTTON}>
          Open Contacts <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {contacts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {contacts.slice(0, 8).map((contact) => (
            <span key={valueOf(contact, 'id') || valueOf(contact, 'email')} className="rounded-lg border border-zinc-850 bg-zinc-950/50 px-2 py-1 text-[11px] text-zinc-300">
              {personName(contact) || valueOf(contact, 'email')}
            </span>
          ))}
          {contacts.length > 8 && <span className="px-1 py-1 text-[11px] text-zinc-500">+{contacts.length - 8} more</span>}
        </div>
      )}
    </div>
  );
}

function ProspectResultsCard({ result }: { result: JsonRecord }) {
  const queryClient = useQueryClient();
  const search = asRecord(result.search);
  const searchId = valueOf(search, 'id');
  const done = search?.done === true;
  const status = valueOf(search, 'status');
  const companies = records(result.companies);
  const qualified = companies.filter((company) => valueOf(company, 'status') === 'qualified');
  const people = records(result.people);
  const needEmail = Number(result.excludedWithoutReadyEmail) || 0;
  const [picked, setPicked] = useState<Set<string>>(() => new Set(people.map((person) => valueOf(person, 'id'))));
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState('');

  const mutation = useMutation({
    mutationFn: (ids: string[]) => api.prospects.addToContacts({ ids, duplicateStrategy: 'SKIP' }),
    onSuccess: (res: LooseApiResponse, ids) => {
      setAdded((current) => new Set([...current, ...ids]));
      setPicked(new Set());
      setNotice(`${res.added || 0} added${res.duplicates ? ` · ${res.duplicates} already in Contacts` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['prospect-people'] });
    },
    onError: (err: Error) => setNotice(err.message || 'Could not add these people.'),
  });
  const selectedIds = [...picked].filter((id) => id && !added.has(id));

  return (
    <div className={`${CARD} border-sky-500/20 bg-sky-500/4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className={`${CARD_LABEL} text-sky-300`}>
            <Telescope className="h-4 w-4" /> Prospect Finder
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">
            {qualified.length} matching compan{qualified.length === 1 ? 'y' : 'ies'} · {people.length} {people.length === 1 ? 'person' : 'people'} with a published email
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {done ? 'Search finished' : status === 'failed' ? 'Search stopped with an error' : 'Search paused after one pass'}
            {needEmail ? ` · ${needEmail} more need an email` : ''}
          </p>
        </div>
        {searchId && (
          <Link href={`/prospects?search=${searchId}`} className={LINK_BUTTON}>
            {done ? 'Open in Prospect Finder' : 'Resume in Prospect Finder'} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {qualified.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {qualified.slice(0, 8).map((company) => (
            <span key={valueOf(company, 'id') || valueOf(company, 'domain')} className="flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-950/50 px-2 py-1 text-[11px] text-zinc-300">
              {valueOf(company, 'name') || valueOf(company, 'domain')}
              {Number(company.score) > 0 && <span className="font-bold text-sky-300">{valueOf(company, 'score')}%</span>}
            </span>
          ))}
        </div>
      )}

      {people.length > 0 && (
        <>
          <div className="mt-3 divide-y divide-zinc-850 overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950/50">
            {people.slice(0, PREVIEW_ROWS * 2).map((person) => {
              const id = valueOf(person, 'id');
              const isAdded = added.has(id);
              return (
                <label key={id || valueOf(person, 'email')} className={`flex items-start gap-3 px-3 py-2.5 text-xs ${isAdded ? 'opacity-60' : 'cursor-pointer hover:bg-zinc-900/60'}`}>
                  <input
                    type="checkbox"
                    checked={picked.has(id) && !isAdded}
                    disabled={!id || isAdded}
                    onChange={() => setPicked((current) => toggle(current, id))}
                    className="mt-0.5 h-3.5 w-3.5 flex-none rounded border-zinc-700 bg-zinc-950 accent-indigo-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-zinc-100">{personName(person)}</span>
                    <span className="block truncate text-zinc-500">
                      {[valueOf(person, 'jobTitle'), valueOf(person, 'companyName')].filter(Boolean).join(' · ')}
                    </span>
                    <span className="block break-all text-zinc-400">{valueOf(person, 'email')}</span>
                  </span>
                  {isAdded && (
                    <span className="flex flex-none items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <Check className="h-3 w-3" /> Added
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-500">
              {notice || (people.length > PREVIEW_ROWS * 2 ? `Showing ${PREVIEW_ROWS * 2} of ${people.length}` : `${selectedIds.length} selected`)}
            </span>
            <button onClick={() => mutation.mutate(selectedIds)} disabled={!selectedIds.length || mutation.isPending} className={PRIMARY_BUTTON}>
              {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Add {selectedIds.length || ''} to Contacts
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CampaignPreviewCard({ result, calling }: { result: JsonRecord; calling: boolean }) {
  const preview = asRecord(result.preview) || result;
  const template = asRecord(preview.template);
  const campaign = asRecord(preview.campaign);
  const contacts = records(preview.contacts);
  const subject = valueOf(template, 'subject');
  const body = valueOf(template, 'bodyText') || valueOf(template, 'bodyHtml');
  const objective = valueOf(campaign, 'objective');
  const recipientResult = asRecord(preview.recipientResult);
  const count = contacts.length || valueOf(recipientResult, 'added') || valueOf(asRecord(result.pendingAction), 'contactCount') || 0;
  const Icon = calling ? PhoneCall : Mail;
  return (
    <div className={`${CARD} border-indigo-500/25 bg-indigo-500/5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className={`${CARD_LABEL} text-indigo-300`}>
            <Icon className="h-4 w-4" /> {calling ? 'Calling campaign draft' : 'Email campaign draft'}
          </div>
          <h3 className="mt-2 text-base font-bold text-white">{valueOf(campaign, 'name') || 'Outreach campaign'}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {count} recipient(s) · Nothing will be sent until you confirm.
          </p>
        </div>
        <Link href={calling ? '/calling-campaigns' : '/email-campaigns'} className={LINK_BUTTON}>
          Open drafts <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {subject && (
        <div className="mt-4 rounded-xl border border-zinc-850 bg-zinc-950/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Subject</p>
          <p className="mt-1 text-sm text-zinc-200">{subject}</p>
        </div>
      )}
      {(body || objective) && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-zinc-850 bg-zinc-950/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{body ? 'Message' : 'Objective'}</p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-zinc-300">{body || objective}</p>
        </div>
      )}
      {contacts.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-zinc-850">
          <div className="border-b border-zinc-850 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Recipients</div>
          {contacts.slice(0, 5).map((contact) => (
            <div key={valueOf(contact, 'id') || valueOf(contact, 'email')} className="flex items-center justify-between gap-3 border-b border-zinc-850/70 px-3 py-2 text-xs last:border-0">
              <span className="truncate text-zinc-300">{personName(contact) || valueOf(contact, 'email')}</span>
              <span className="truncate text-zinc-600">{valueOf(contact, 'company') || valueOf(contact, 'email')}</span>
            </div>
          ))}
          {contacts.length > 5 && <p className="px-3 py-2 text-[10px] text-zinc-600">+ {contacts.length - 5} more recipients</p>}
        </div>
      )}
    </div>
  );
}

function SignalInsightsCard({ result, onPrompt }: { result: JsonRecord; onPrompt: (prompt: string) => void }) {
  const stats = asRecord(result.stats);
  const feed = records(result.feed);
  const reviewQueue = records(result.reviewQueue);
  return (
    <div className={`${CARD} border-emerald-500/20 bg-emerald-500/5`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`${CARD_LABEL} text-emerald-300`}>
          <Radio className="h-4 w-4" /> Signal intelligence
        </div>
        <span className="text-[10px] text-zinc-600">
          {valueOf(result, 'fetchedAt') ? `Updated ${new Date(valueOf(result, 'fetchedAt')).toLocaleString()}` : 'Workspace data'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['Signals', valueOf(stats, 'totalSignals')],
          ['Watched', valueOf(stats, 'watchedCompanies')],
          ['Review', String(reviewQueue.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-850 bg-zinc-950/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">{value || '0'}</p>
          </div>
        ))}
      </div>
      {feed.length > 0 && (
        <div className="mt-4 space-y-2">
          {feed.slice(0, 5).map((signal) => (
            <div key={valueOf(signal, 'id') || valueOf(signal, 'title')} className="rounded-xl border border-zinc-850 bg-zinc-950/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-200">{valueOf(signal, 'title') || 'Signal detected'}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {valueOf(signal, 'companyName') || 'Unknown company'} · {valueOf(signal, 'typeLabel') || valueOf(signal, 'type')}
                  </p>
                </div>
                {valueOf(signal, 'url') && (
                  <a href={valueOf(signal, 'url')} target="_blank" rel="noreferrer" aria-label="Open signal source" className="text-zinc-600 hover:text-emerald-300">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-400">{valueOf(signal, 'summary')}</p>
            </div>
          ))}
        </div>
      )}
      {reviewQueue.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Clock3 className="h-3.5 w-3.5" /> {reviewQueue.length} Signal review action(s) waiting
          </div>
          <p className="mt-1 text-xs text-zinc-500">Ask the assistant to prepare a preview before approving any outreach.</p>
          <button
            onClick={() => onPrompt('Summarize the pending Signal review queue and prepare the highest-confidence action for approval.')}
            className="mt-3 rounded-lg border border-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Review queue
          </button>
        </div>
      )}
    </div>
  );
}

function SignalReviewCard({ result }: { result: JsonRecord }) {
  const review = asRecord(result.review);
  const signal = asRecord(review?.signal);
  const contact = asRecord(review?.contact);
  const playbook = asRecord(review?.playbook);
  const preview = asRecord(review?.preview);
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
      <div className={`${CARD_LABEL} text-amber-300`}>
        <ShieldCheck className="h-4 w-4" /> Signal action preview
      </div>
      <h3 className="mt-2 text-sm font-bold text-white">{valueOf(signal, 'title') || 'Pending Signal action'}</h3>
      <p className="mt-1 text-xs text-zinc-400">
        {[valueOf(signal, 'companyName'), valueOf(contact, 'name'), valueOf(playbook, 'name')].filter(Boolean).join(' · ')}
      </p>
      {preview && (
        <div className="mt-3 rounded-xl border border-zinc-850 bg-zinc-950/50 p-3 text-xs text-zinc-300">
          <p className="font-semibold">{valueOf(preview, 'subject')}</p>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-zinc-500">{valueOf(preview, 'bodyText') || valueOf(preview, 'bodyHtml')}</p>
        </div>
      )}
    </div>
  );
}
