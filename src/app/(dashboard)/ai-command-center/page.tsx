'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
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
  'Show me today\'s outreach performance',
  'Find companies that are currently hiring',
  'Summarize my unread replies',
  'Which campaigns are scheduled?',
];

type Activity = { id: string; label: string; done?: boolean; error?: boolean };

export default function AiCommandCenterPage() {
  const [threads, setThreads] = useState<AiChatThread[]>([]);
  const [thread, setThread] = useState<(AiChatThread & { messages: AiChatMessage[] }) | null>(null);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);
  const [defaultModel, setDefaultModel] = useState('gemini-flash-lite-latest');
  const [model, setModel] = useState('gemini-flash-lite-latest');
  const [reasoning, setReasoning] = useState<AiChatReasoningEffort>('medium');
  const [input, setInput] = useState('');
  const [streamText, setStreamText] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeMessages = thread?.messages || [];
  const pendingAction = thread?.pendingAction || null;
  const selectedThreadId = thread?.id;

  useEffect(() => {
    let mounted = true;
    Promise.all([api.aiChat.models(), api.aiChat.threads()])
      .then(async ([modelData, threadData]) => {
        if (!mounted) return;
        setModels(modelData.models || []);
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

  const chooseThread = async (id: string) => {
    if (streaming || id === selectedThreadId) return;
    setError('');
    const detail = await api.aiChat.getThread(id);
    setThread(detail);
    setModel(detail.model || defaultModel);
    setReasoning(detail.reasoningEffort || 'medium');
  };

  const newThread = async () => {
    const created = await api.aiChat.createThread({ model, reasoningEffort: reasoning });
    setThreads((current) => [created, ...current]);
    const detail = await api.aiChat.getThread(created.id);
    setThread(detail);
    setStreamText('');
    inputRef.current?.focus();
  };

  const deleteThread = async (id: string) => {
    if (!window.confirm('Delete this conversation?')) return;
    await api.aiChat.deleteThread(id);
    const remaining = threads.filter((item) => item.id !== id);
    setThreads(remaining);
    if (id === selectedThreadId) {
      if (remaining[0]) chooseThread(remaining[0].id);
      else newThread();
    }
  };

  const updatePreference = async (next: { model?: string; reasoningEffort?: AiChatReasoningEffort }) => {
    if (!thread) return;
    if (next.model) setModel(next.model);
    if (next.reasoningEffort) setReasoning(next.reasoningEffort);
    const updated = await api.aiChat.updateThread(thread.id, next);
    setThread((current) => (current ? { ...current, ...updated } : current));
  };

  const sendMessage = async (value = input, confirm = false) => {
    if (!thread || streaming || (!value.trim() && !confirm)) return;
    const text = value.trim() || 'Confirm and execute the pending action.';
    setInput('');
    setError('');
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
        if (event.type === 'error') setError(String(event.data.message || 'The assistant could not complete the request.'));
      });
      const detail = await api.aiChat.getThread(thread.id);
      setThread(detail);
      setThreads((current) => [detail, ...current.filter((item) => item.id !== detail.id)]);
      setStreamText('');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('The assistant could not complete the request.');
      if (error.name !== 'AbortError') setError(error.message);
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const addActivity = (label: string) => {
    setActivities((current) => [...current, { id: `${label}-${Date.now()}-${Math.random()}`, label }]);
  };

  const completeActivity = (label: string) => {
    setActivities((current) => current.map((item) => (item.label.toLowerCase().includes(friendlyTool(label).toLowerCase()) ? { ...item, done: true } : item)));
  };

  const hasConversation = activeMessages.some((message) => message.role === 'user' || message.role === 'assistant');

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center text-zinc-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading AI Command Center…</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950/60 shadow-2xl">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-none overflow-hidden border-r border-zinc-850 bg-zinc-950/80 transition-[width] duration-200`}>
        <div className="flex h-full w-64 flex-col p-3">
          <button onClick={newThread} className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20">
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </button>
          <p className="sig-label mt-6 px-2 text-zinc-600">CONVERSATIONS</p>
          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {threads.map((item) => (
              <div key={item.id} className={`group flex items-center gap-1 rounded-lg ${item.id === selectedThreadId ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/70'}`}>
                <button onClick={() => chooseThread(item.id)} className="min-w-0 flex-1 truncate px-3 py-2 text-left text-xs font-medium">{item.title}</button>
                <button onClick={() => deleteThread(item.id)} aria-label="Delete conversation" className="mr-1 rounded p-1.5 text-zinc-600 opacity-0 hover:text-rose-400 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3 text-[11px] leading-5 text-zinc-500">
            <Sparkles className="mb-1 h-4 w-4 text-indigo-400" />
            The assistant can research your workspace, prepare campaigns, and show a preview before anything is sent.
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setSidebarOpen((current) => !current)} aria-label="Toggle conversations" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200">
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Bot className="h-4 w-4" /></div>
            <div className="min-w-0"><h1 className="truncate text-sm font-bold text-white">AI Command Center</h1><p className="text-[10px] text-zinc-500">Your workspace, orchestrated</p></div>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 sm:flex">Model
              <select value={model} onChange={(event) => updatePreference({ model: event.target.value })} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-medium normal-case tracking-normal text-zinc-300 outline-none focus:border-indigo-500/60">
                {(models.length ? models : [{ value: defaultModel, label: defaultModel }]).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Reasoning
              <select value={reasoning} onChange={(event) => updatePreference({ reasoningEffort: event.target.value as AiChatReasoningEffort })} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-medium normal-case tracking-normal text-zinc-300 outline-none focus:border-indigo-500/60">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {!hasConversation && !streaming ? <EmptyState onSuggestion={(suggestion) => { setInput(suggestion); inputRef.current?.focus(); }} /> : <div className="mx-auto max-w-3xl space-y-6">
            {activeMessages.filter((message) => message.role !== 'tool').map((message) => <MessageBubble key={message.id} message={message} />)}
            {activities.length > 0 && streaming && <ActivityPanel activities={activities} />}
            {streaming && streamText && <MessageBubble message={{ id: 'streaming', threadId: thread?.id || '', role: 'assistant', content: streamText }} streaming />}
            {error && <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">{error}</div>}
            {pendingAction && !streaming && <ConfirmationCard action={pendingAction} onConfirm={() => sendMessage('Confirm launch', true)} onCancel={() => sendMessage('Cancel', false)} />}
          </div>}
        </div>

        <div className="border-t border-zinc-850 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl focus-within:border-indigo-500/50">
              <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} disabled={streaming} rows={3} placeholder="Ask anything about your outreach workspace…" className="w-full resize-none bg-transparent px-4 pb-12 pt-4 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-60" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">Enter to send · Shift + Enter for a new line</span>
                {streaming ? <button onClick={stop} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300"><Square className="h-3 w-3 fill-current" /> Stop</button> : <button onClick={() => sendMessage()} disabled={!input.trim()} aria-label="Send message" className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5" /> Send</button>}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">AI can make mistakes. Review the preview before sending emails or launching calls.</p>
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

function EmptyState({ onSuggestion }: { onSuggestion: (value: string) => void }) {
  return <div className="flex min-h-[48vh] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.15)]"><Sparkles className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-black tracking-tight text-white">What are we building today?</h2><p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">Search prospects, enrich contacts, understand your funnel, prepare campaigns, and manage outreach from one conversation.</p><div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">{SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => onSuggestion(suggestion)} className="rounded-xl border border-zinc-850 bg-zinc-900/50 px-4 py-3 text-left text-xs text-zinc-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-zinc-200"><Plus className="mr-2 inline h-3.5 w-3.5 text-indigo-400" />{suggestion}</button>)}</div></div>;
}

function MessageBubble({ message, streaming = false }: { message: AiChatMessage; streaming?: boolean }) {
  const isUser = message.role === 'user';
  return <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? 'bg-indigo-500 text-white' : 'border border-zinc-850 bg-zinc-900/70 text-zinc-200'}`}><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50">{isUser ? 'You' : 'AI Command Center'}{streaming && <Loader2 className="h-3 w-3 animate-spin" />}</div><div className="whitespace-pre-wrap break-words">{message.content}</div>{!isUser && <button onClick={() => navigator.clipboard?.writeText(message.content)} className="mt-3 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300"><Copy className="h-3 w-3" /> Copy</button>}</div></div>;
}

function ActivityPanel({ activities }: { activities: Activity[] }) {
  return <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-indigo-200"><div className="mb-2 flex items-center gap-2 font-semibold"><Wrench className="h-3.5 w-3.5" /> Working across your workspace</div><div className="space-y-1.5">{activities.slice(-5).map((activity) => <div key={activity.id} className="flex items-center gap-2 text-zinc-400"><span className={activity.done ? 'text-emerald-400' : 'text-indigo-400'}>{activity.done ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}</span>{activity.label}</div>)}</div></div>;
}

function ConfirmationCard({ action, onConfirm, onCancel }: { action: NonNullable<AiChatThread['pendingAction']>; onConfirm: () => void; onCancel: () => void }) {
  const calling = action.kind === 'launch_calling_campaign';
  return <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-amber-500/15 p-2 text-amber-300"><Sparkles className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">Ready to launch {calling ? 'calling' : 'email'} campaign</p><p className="mt-1 text-xs leading-5 text-zinc-400">{action.campaignName} · {action.contactCount || 0} contact(s). This will start external outreach and cannot be undone for messages already sent.</p><div className="mt-3 flex gap-2"><button onClick={onConfirm} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400">Confirm launch</button><button onClick={onCancel} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900">Cancel</button></div></div><button onClick={onCancel} aria-label="Cancel launch" className="text-zinc-600 hover:text-zinc-300"><X className="h-4 w-4" /></button></div></div>;
}
