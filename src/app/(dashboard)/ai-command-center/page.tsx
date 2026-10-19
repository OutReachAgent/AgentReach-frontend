'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { api, streamAiChatMessage } from '@/lib/api';
import type {
  AiChatMessage,
  AiChatReasoningEffort,
  AiChatStreamEvent,
  AiChatThread,
} from '@/lib/api';

const SUGGESTIONS = [
  { label: "Today's outreach performance", prompt: "Show me today's outreach performance" },
  { label: 'High-intent Signals', prompt: 'Show me high-intent Signals from the last 7 days and recommend my next outreach action.' },
  { label: 'Hiring companies', prompt: 'Find companies that are currently hiring' },
  { label: 'Unread replies', prompt: 'Summarize my unread replies' },
  { label: 'Scheduled campaigns', prompt: 'Which campaigns are scheduled?' },
];

type Activity = { id: string; label: string; done?: boolean };
type JsonRecord = Record<string, unknown>;

export default function AiCommandCenterPage() {
  const [threads, setThreads] = useState<AiChatThread[]>([]);
  const [thread, setThread] = useState<(AiChatThread & { messages: AiChatMessage[] }) | null>(null);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);
  const [reasoningOptions, setReasoningOptions] = useState<Array<{ value: AiChatReasoningEffort; label: string; description: string }>>([]);
  const [defaultModel, setDefaultModel] = useState('gemini-flash-lite-latest');
  const [model, setModel] = useState('gemini-flash-lite-latest');
  const [reasoning, setReasoning] = useState<AiChatReasoningEffort>('medium');
  const [input, setInput] = useState('');
  const [streamText, setStreamText] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastConfirm, setLastConfirm] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState('');
  const [renamingId, setRenamingId] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeMessages = thread?.messages || [];
  const pendingAction = thread?.pendingAction || null;
  const selectedThreadId = thread?.id;
  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? threads.filter((item) => item.title.toLowerCase().includes(query)) : threads;
  }, [search, threads]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.aiChat.models(), api.aiChat.threads()])
      .then(async ([modelData, threadData]) => {
        if (!mounted) return;
        setModels(modelData.models || []);
        setReasoningOptions(modelData.reasoningEfforts || []);
        setDefaultModel(modelData.defaultModel);
        setModel(modelData.defaultModel);
        setThreads(threadData || []);
        const first = threadData?.[0] || (await api.aiChat.createThread({ model: modelData.defaultModel }));
        if (!threadData?.length) setThreads([first]);
        const detail = await api.aiChat.getThread(first.id);
        if (mounted) {
          setThread(detail);
          setModel(detail.model || modelData.defaultModel);
          setReasoning(detail.reasoningEffort || 'medium');
        }
      })
      .catch((err: Error) => mounted && setError(err.message || 'Could not load AI Command Center.'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: streaming ? 'smooth' : 'auto' });
  }, [activeMessages.length, activities.length, streamText, streaming]);

  const chooseThread = async (id: string) => {
    if (streaming || id === selectedThreadId) return;
    setError('');
    try {
      const detail = await api.aiChat.getThread(id);
      setThread(detail);
      setModel(detail.model || defaultModel);
      setReasoning(detail.reasoningEffort || 'medium');
      setSidebarOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not open that conversation.');
    }
  };

  const newThread = async () => {
    if (streaming) return;
    try {
      const created = await api.aiChat.createThread({ model, reasoningEffort: reasoning });
      setThreads((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      const detail = await api.aiChat.getThread(created.id);
      setThread(detail);
      setStreamText('');
      setError('');
      setSidebarOpen(false);
      inputRef.current?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create a conversation.');
    }
  };

  const deleteThread = async (id: string) => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await api.aiChat.deleteThread(id);
      const remaining = threads.filter((item) => item.id !== id);
      setThreads(remaining);
      if (id === selectedThreadId) {
        if (remaining[0]) await chooseThread(remaining[0].id);
        else await newThread();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete that conversation.');
    }
  };

  const saveTitle = async (id: string) => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) return;
    try {
      const updated = await api.aiChat.updateThread(id, { title: nextTitle });
      setThreads((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setThread((current) => (current?.id === id ? { ...current, ...updated } : current));
      setRenamingId('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not rename that conversation.');
    }
  };

  const updatePreference = async (next: { model?: string; reasoningEffort?: AiChatReasoningEffort }) => {
    if (!thread) return;
    if (next.model) setModel(next.model);
    if (next.reasoningEffort) setReasoning(next.reasoningEffort);
    try {
      const updated = await api.aiChat.updateThread(thread.id, next);
      setThread((current) => (current ? { ...current, ...updated } : current));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save this preference.');
    }
  };

  const sendMessage = async (value = input, confirm = false) => {
    if (!thread || streaming || (!value.trim() && !confirm)) return;
    const text = value.trim() || 'Confirm and execute the pending action.';
    setInput('');
    setError('');
    setInterrupted(false);
    setLastPrompt(text);
    setLastConfirm(confirm);
    setStreaming(true);
    setStreamText('');
    setActivities([]);
    setThread((current) =>
      current
        ? { ...current, messages: [...current.messages, { id: `local-${Date.now()}`, threadId: current.id, role: 'user', content: text }] }
        : current,
    );
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await streamAiChatMessage(
        `/ai-chat/threads/${thread.id}/messages/stream`,
        { content: text, model, reasoningEffort: reasoning, confirm },
        controller.signal,
      );
      if (!response.body) throw new Error('The assistant returned an empty stream.');
      await readEvents(response, (event) => {
        if (event.type === 'delta') setStreamText((current) => current + String(event.data.text || ''));
        if (event.type === 'status') addActivity(String(event.data.label || 'Working'));
        if (event.type === 'tool_start') addActivity(`Using ${friendlyTool(String(event.data.name || 'workspace tool'))}`);
        if (event.type === 'tool_result') completeActivity(String(event.data.name || 'workspace tool'));
        if (event.type === 'error') {
          setError(String(event.data.message || 'The assistant could not complete the request.'));
          setInterrupted(true);
        }
      });
      const detail = await api.aiChat.getThread(thread.id);
      setThread(detail);
      setThreads((current) => [detail, ...current.filter((item) => item.id !== detail.id)]);
      setStreamText('');
    } catch (err: unknown) {
      const streamError = err instanceof Error ? err : new Error('The assistant could not complete the request.');
      if (streamError.name === 'AbortError') {
        setError('Generation stopped. You can retry the last request.');
      } else {
        setError(streamError.message);
        if (!confirm) setInput(text);
      }
      setInterrupted(true);
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const stop = () => {
    setError('Stopping the current request…');
    abortRef.current?.abort();
  };

  const copyMessage = async (message: AiChatMessage) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId(''), 1600);
  };

  const addActivity = (label: string) => {
    setActivities((current) => [...current, { id: `${label}-${Date.now()}-${Math.random()}`, label }]);
  };

  const completeActivity = (label: string) => {
    setActivities((current) => current.map((item) => (item.label.toLowerCase().includes(friendlyTool(label).toLowerCase()) ? { ...item, done: true } : item)));
  };

  const hasConversation = activeMessages.some((message) => message.role === 'user' || message.role === 'assistant' || message.role === 'tool');

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center text-zinc-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading AI Command Center…</div>;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950/60 shadow-2xl">
      {sidebarOpen && <button aria-label="Close conversations" onClick={() => setSidebarOpen(false)} className="absolute inset-0 z-20 bg-black/50 sm:hidden" />}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:-ml-64'} absolute inset-y-0 left-0 z-30 flex w-72 flex-none transform overflow-hidden border-r border-zinc-850 bg-zinc-950/95 transition-transform duration-200 sm:relative sm:z-auto sm:w-64 sm:bg-zinc-950/80`}>
        <div className="flex h-full w-72 flex-col p-3 sm:w-64">
          <button onClick={newThread} className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20">
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </button>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search conversations" placeholder="Search conversations" className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 py-2 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/50" />
          </div>
          <p className="sig-label mt-6 px-2 text-zinc-600">CONVERSATIONS</p>
          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {filteredThreads.length ? filteredThreads.map((item) => (
              <div key={item.id} className={`group flex items-center gap-1 rounded-lg ${item.id === selectedThreadId ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/70'}`}>
                {renamingId === item.id ? <input autoFocus value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void saveTitle(item.id); if (event.key === 'Escape') setRenamingId(''); }} onBlur={() => void saveTitle(item.id)} className="min-w-0 flex-1 rounded bg-zinc-800 px-2 py-1.5 text-xs text-white outline-none" /> : <button onClick={() => void chooseThread(item.id)} className="min-w-0 flex-1 truncate px-3 py-2 text-left text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">{item.title}</button>}
                <button onClick={() => { setRenamingId(item.id); setTitleDraft(item.title); }} aria-label={`Rename ${item.title}`} title="Rename conversation" className="rounded p-1.5 text-zinc-600 opacity-0 hover:text-zinc-300 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => void deleteThread(item.id)} aria-label={`Delete ${item.title}`} title="Delete conversation" className="mr-1 rounded p-1.5 text-zinc-600 opacity-0 hover:text-rose-400 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )) : <p className="px-3 py-4 text-xs text-zinc-600">No conversations found.</p>}
          </div>
          <div className="mt-3 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3 text-[11px] leading-5 text-zinc-500">
            <ShieldCheck className="mb-1 h-4 w-4 text-emerald-400" />
            The assistant researches your workspace and prepares an editable preview before external outreach is launched.
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setSidebarOpen((current) => !current)} aria-label="Toggle conversations" title="Toggle conversations" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Bot className="h-4 w-4" /></div>
            <div className="min-w-0"><h1 className="truncate text-sm font-bold text-white">AI Command Center</h1><p className="text-[10px] text-zinc-500">Research, Signals, and outreach orchestration</p></div>
          </div>
          <div className="flex items-center gap-2">
            {thread?.status === 'error' && <span className="hidden items-center gap-1 text-[10px] font-semibold text-rose-300 sm:flex"><Radio className="h-3 w-3" /> Needs attention</span>}
            <label className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 lg:flex">Model
              <select value={model} onChange={(event) => void updatePreference({ model: event.target.value })} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-medium normal-case tracking-normal text-zinc-300 outline-none focus:border-indigo-500/60">
                {(models.length ? models : [{ value: defaultModel, label: defaultModel }]).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label title={reasoningOptions.find((item) => item.value === reasoning)?.description || 'Controls research depth'} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Depth
              <select value={reasoning} onChange={(event) => void updatePreference({ reasoningEffort: event.target.value as AiChatReasoningEffort })} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-medium normal-case tracking-normal text-zinc-300 outline-none focus:border-indigo-500/60">
                {(reasoningOptions.length ? reasoningOptions : [{ value: 'low' as const, label: 'Fast', description: '' }, { value: 'medium' as const, label: 'Balanced', description: '' }, { value: 'high' as const, label: 'Deep', description: '' }]).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>
        </header>

        <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {!hasConversation && !streaming ? <EmptyState onSuggestion={(suggestion) => { setInput(suggestion); inputRef.current?.focus(); }} /> : <div className="mx-auto max-w-3xl space-y-6">
            {activeMessages.map((message) => message.role === 'tool' ? <ToolArtifact key={message.id} message={message} onPrompt={(prompt) => { setInput(prompt); inputRef.current?.focus(); }} /> : <MessageBubble key={message.id} message={message} copied={copiedMessageId === message.id} onCopy={() => void copyMessage(message)} />)}
            {activities.length > 0 && streaming && <ActivityPanel activities={activities} />}
            {streaming && streamText && <MessageBubble message={{ id: 'streaming', threadId: thread?.id || '', role: 'assistant', content: streamText }} streaming />}
            {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-sm text-rose-300"><span>{error}</span>{interrupted && lastPrompt && <button onClick={() => void sendMessage(lastPrompt, lastConfirm)} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/10"><RotateCcw className="h-3.5 w-3.5" /> Retry</button>}</div>}
            {pendingAction && !streaming && <ConfirmationCard action={pendingAction} onConfirm={() => void sendMessage('Confirm launch', true)} onCancel={() => void sendMessage('Cancel', false)} />}
            <div ref={bottomRef} />
          </div>}
        </div>

        <div className="border-t border-zinc-850 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl focus-within:border-indigo-500/50">
              <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} disabled={streaming} rows={3} placeholder="Ask about outreach, contacts, campaigns, inbox, or Signals…" className="w-full resize-none bg-transparent px-4 pb-12 pt-4 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-60" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">Enter to send · Shift + Enter for a new line</span>
                {streaming ? <button onClick={stop} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><Square className="h-3 w-3 fill-current" /> Stop</button> : <button onClick={() => void sendMessage()} disabled={!input.trim()} aria-label="Send message" className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"><Send className="h-3.5 w-3.5" /> Send</button>}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">AI can make mistakes. Review Signal evidence and campaign previews before executing outreach.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

async function readEvents(response: Response, onEvent: (event: AiChatStreamEvent) => void) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const raw of events) {
      const eventName = raw.match(/^event:\s*(.+)$/m)?.[1] as AiChatStreamEvent['type'] | undefined;
      const data = raw.match(/^data:\s*(.+)$/m)?.[1];
      if (eventName && data) onEvent({ type: eventName, data: JSON.parse(data) });
    }
    if (done) break;
  }
}

function friendlyTool(name: string) {
  return name.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function valueOf(record: JsonRecord | null, key: string): string {
  const value = record?.[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function EmptyState({ onSuggestion }: { onSuggestion: (value: string) => void }) {
  return <div className="flex min-h-[48vh] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.15)]"><Sparkles className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-black tracking-tight text-white">What should we orchestrate today?</h2><p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">Research prospects, understand Signals, review your funnel, prepare campaigns, and manage outreach from one conversation.</p><div className="mt-8 grid w-full max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-3">{SUGGESTIONS.map((suggestion) => <button key={suggestion.label} onClick={() => onSuggestion(suggestion.prompt)} className="rounded-xl border border-zinc-850 bg-zinc-900/50 px-4 py-3 text-left text-xs text-zinc-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><Plus className="mr-2 inline h-3.5 w-3.5 text-indigo-400" />{suggestion.label}</button>)}</div></div>;
}

function MessageBubble({ message, streaming = false, copied = false, onCopy }: { message: AiChatMessage; streaming?: boolean; copied?: boolean; onCopy?: () => void }) {
  const isUser = message.role === 'user';
  return <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? 'bg-indigo-500 text-white' : 'border border-zinc-850 bg-zinc-900/70 text-zinc-200'}`}><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50">{isUser ? 'You' : 'AI Command Center'}{streaming && <Loader2 className="h-3 w-3 animate-spin" />}</div><div className="whitespace-pre-wrap break-words">{message.content}</div>{!isUser && onCopy && <button onClick={onCopy} className="mt-3 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">{copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}</button>}</div></div>;
}

function ToolArtifact({ message, onPrompt }: { message: AiChatMessage; onPrompt: (prompt: string) => void }) {
  const result = message.toolResult || {};
  if (message.toolName === 'prepare_email_campaign' || message.toolName === 'prepare_calling_campaign') return <CampaignPreviewCard result={result} />;
  if (message.toolName === 'prepare_signal_action') return <SignalReviewCard result={result} />;
  if (message.toolName === 'get_signal_insights' || (message.toolName === 'get_workspace_data' && asRecord(result)?.stats && asRecord(result)?.feed)) return <SignalInsightsCard result={result} onPrompt={onPrompt} />;
  return null;
}

function CampaignPreviewCard({ result }: { result: JsonRecord }) {
  const preview = asRecord(result.preview) || result;
  const template = asRecord(preview.template);
  const campaign = asRecord(preview.campaign);
  const contacts = asArray(preview.contacts).map((item) => asRecord(item)).filter((item): item is JsonRecord => !!item);
  const subject = valueOf(template, 'subject');
  const body = valueOf(template, 'bodyText') || valueOf(template, 'bodyHtml');
  const recipientResult = asRecord(preview.recipientResult);
  return <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300"><ShieldCheck className="h-4 w-4" /> Draft preview</div><h3 className="mt-2 text-base font-bold text-white">{valueOf(campaign, 'name') || 'Outreach campaign'}</h3><p className="mt-1 text-xs text-zinc-400">{contacts.length || valueOf(recipientResult, 'added') || 0} recipient(s) · Nothing will be sent until you confirm.</p></div><ChevronDown className="h-4 w-4 text-zinc-600" /></div>{subject && <div className="mt-4 rounded-xl border border-zinc-850 bg-zinc-950/50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Subject</p><p className="mt-1 text-sm text-zinc-200">{subject}</p></div>}{body && <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-zinc-850 bg-zinc-950/50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Message</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-zinc-300">{body}</p></div>}{contacts.length > 0 && <div className="mt-3 overflow-hidden rounded-xl border border-zinc-850"><div className="border-b border-zinc-850 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Recipients</div>{contacts.slice(0, 5).map((contact) => <div key={valueOf(contact, 'id') || valueOf(contact, 'email')} className="flex items-center justify-between gap-3 border-b border-zinc-850/70 px-3 py-2 text-xs last:border-0"><span className="truncate text-zinc-300">{`${valueOf(contact, 'firstName')} ${valueOf(contact, 'lastName')}`.trim() || valueOf(contact, 'email')}</span><span className="truncate text-zinc-600">{valueOf(contact, 'company') || valueOf(contact, 'email')}</span></div>)}{contacts.length > 5 && <p className="px-3 py-2 text-[10px] text-zinc-600">+ {contacts.length - 5} more recipients</p>}</div>}</div>;
}

function SignalInsightsCard({ result, onPrompt }: { result: JsonRecord; onPrompt: (prompt: string) => void }) {
  const stats = asRecord(result.stats);
  const feed = asArray(result.feed).map((item) => asRecord(item)).filter((item): item is JsonRecord => !!item);
  const reviewQueue = asArray(result.reviewQueue).map((item) => asRecord(item)).filter((item): item is JsonRecord => !!item);
  return <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300"><Radio className="h-4 w-4" /> Signal intelligence</div><span className="text-[10px] text-zinc-600">{valueOf(result, 'fetchedAt') ? `Updated ${new Date(valueOf(result, 'fetchedAt')).toLocaleString()}` : 'Workspace data'}</span></div><div className="mt-4 grid grid-cols-3 gap-2">{[['Signals', valueOf(stats, 'totalSignals')], ['Watched', valueOf(stats, 'watchedCompanies')], ['Review', String(reviewQueue.length)]].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-850 bg-zinc-950/50 p-3"><p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-1 text-lg font-bold text-white">{value || '0'}</p></div>)}</div>{feed.length > 0 && <div className="mt-4 space-y-2">{feed.slice(0, 5).map((signal) => <div key={valueOf(signal, 'id') || valueOf(signal, 'title')} className="rounded-xl border border-zinc-850 bg-zinc-950/50 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-200">{valueOf(signal, 'title') || 'Signal detected'}</p><p className="mt-1 text-xs text-zinc-500">{valueOf(signal, 'companyName') || 'Unknown company'} · {valueOf(signal, 'typeLabel') || valueOf(signal, 'type')}</p></div>{valueOf(signal, 'url') && <a href={valueOf(signal, 'url')} target="_blank" rel="noreferrer" aria-label="Open signal source" className="text-zinc-600 hover:text-emerald-300"><ExternalLink className="h-4 w-4" /></a>}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-400">{valueOf(signal, 'summary')}</p></div>)}</div>}{reviewQueue.length > 0 && <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><div className="flex items-center gap-2 text-xs font-bold text-amber-300"><Clock3 className="h-3.5 w-3.5" /> {reviewQueue.length} Signal review action(s) waiting</div><p className="mt-1 text-xs text-zinc-500">Ask the assistant to prepare a preview before approving any outreach.</p><button onClick={() => onPrompt('Summarize the pending Signal review queue and prepare the highest-confidence action for approval.')} className="mt-3 rounded-lg border border-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Review queue</button></div>}</div>;
}

function SignalReviewCard({ result }: { result: JsonRecord }) {
  const review = asRecord(result.review);
  const signal = asRecord(review?.signal);
  const contact = asRecord(review?.contact);
  const playbook = asRecord(review?.playbook);
  const preview = asRecord(review?.preview);
  return <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300"><ShieldCheck className="h-4 w-4" /> Signal action preview</div><h3 className="mt-2 text-sm font-bold text-white">{valueOf(signal, 'title') || 'Pending Signal action'}</h3><p className="mt-1 text-xs text-zinc-400">{valueOf(signal, 'companyName')} · {valueOf(contact, 'name')} · {valueOf(playbook, 'name')}</p>{preview && <div className="mt-3 rounded-xl border border-zinc-850 bg-zinc-950/50 p-3 text-xs text-zinc-300"><p className="font-semibold">{valueOf(preview, 'subject')}</p><p className="mt-2 line-clamp-4 whitespace-pre-wrap text-zinc-500">{valueOf(preview, 'bodyText') || valueOf(preview, 'bodyHtml')}</p></div>}</div>;
}

function ActivityPanel({ activities }: { activities: Activity[] }) {
  return <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-indigo-200"><div className="mb-2 flex items-center gap-2 font-semibold"><Wrench className="h-3.5 w-3.5" /> Working across your workspace</div><div className="space-y-1.5">{activities.slice(-6).map((activity) => <div key={activity.id} className="flex items-center gap-2 text-zinc-400"><span className={activity.done ? 'text-emerald-400' : 'text-indigo-400'}>{activity.done ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}</span>{activity.label}</div>)}</div></div>;
}

function ConfirmationCard({ action, onConfirm, onCancel }: { action: NonNullable<AiChatThread['pendingAction']>; onConfirm: () => void; onCancel: () => void }) {
  const signalReview = action.kind === 'review_signal_match';
  const calling = action.kind === 'launch_calling_campaign';
  const title = signalReview ? `${action.action === 'reject' ? 'Reject' : 'Approve'} Signal action` : `Ready to launch ${calling ? 'calling' : 'email'} campaign`;
  const details = signalReview ? `${action.signalTitle || 'Signal'} · ${action.companyName || 'Company'} · ${action.contactName || 'Contact'}${action.playbookName ? ` · ${action.playbookName}` : ''}` : `${action.campaignName || 'Campaign'} · ${action.contactCount || 0} contact(s)`;
  return <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-amber-500/15 p-2 text-amber-300"><ShieldCheck className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-zinc-400">{details}. Review the preview above. {signalReview && action.action === 'approve' ? 'This may start external outreach.' : 'This action cannot be undone.'}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={onConfirm} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{signalReview ? (action.action === 'reject' ? 'Reject action' : 'Approve and launch') : 'Confirm launch'}</button><button onClick={onCancel} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">Cancel</button></div></div><button onClick={onCancel} aria-label="Cancel pending action" className="text-zinc-600 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"><X className="h-4 w-4" /></button></div></div>;
}
