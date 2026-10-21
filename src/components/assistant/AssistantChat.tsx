'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  BarChart3,
  CalendarClock,
  Check,
  Copy,
  History,
  Inbox,
  KeyRound,
  Loader2,
  Maximize2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Radar,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Square,
  Telescope,
  Trash2,
  UserSearch,
  X,
} from 'lucide-react';
import { api, streamAiChatMessage } from '@/lib/api';
import type { AiChatMessage, AiChatReasoningEffort, AiChatStreamEvent, AiChatThread } from '@/lib/api';
import { AssistantMarkdown } from './AssistantMarkdown';
import { ToolArtifact, asRecord, describeTool } from './AssistantCards';
import { ScoutLogo } from './ScoutLogo';

export const ASSISTANT_NAME = 'Scout';
export const ASSISTANT_TAGLINE = 'Your outreach assistant';

const SUGGESTIONS = [
  { label: "Today's outreach performance", prompt: "Show me today's outreach performance", icon: BarChart3 },
  { label: 'High-intent Signals', prompt: 'Show me high-intent Signals from the last 7 days and recommend my next outreach action.', icon: Radar },
  { label: 'Find contacts at a company', prompt: 'Find engineering and HR leaders at razorpay.com', icon: UserSearch },
  { label: 'Companies that are hiring', prompt: 'Find companies that are currently hiring backend engineers', icon: Telescope },
  { label: 'Unread replies', prompt: 'Summarize my unread replies', icon: Inbox },
  { label: 'Scheduled campaigns', prompt: 'Which campaigns are scheduled?', icon: CalendarClock },
];

const DEPTH_FALLBACK: Array<{ value: AiChatReasoningEffort; label: string; description: string }> = [
  { value: 'low', label: 'Fast', description: '' },
  { value: 'medium', label: 'Balanced', description: '' },
  { value: 'high', label: 'Deep', description: '' },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const STICK_DISTANCE_PX = 120;
const MAX_INPUT_HEIGHT_PX = 200;

type Activity = { id: string; tool?: string; label: string; done?: boolean; failed?: boolean };
type ThreadDetail = AiChatThread & { messages: AiChatMessage[] };

export type AssistantChatState = { streaming: boolean; pending: boolean };

function threadTime(thread: AiChatThread) {
  return new Date(thread.lastMessageAt || thread.updatedAt || thread.createdAt || 0).getTime();
}

function groupThreads(threads: AiChatThread[], now: number) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = today.getTime();
  const groups: Array<{ label: string; items: AiChatThread[] }> = [];
  for (const thread of threads) {
    const time = threadTime(thread);
    const label = time >= start ? 'Today' : time >= start - DAY_MS ? 'Yesterday' : time >= start - 7 * DAY_MS ? 'Previous 7 days' : 'Older';
    const group = groups.find((item) => item.label === label);
    if (group) group.items.push(thread);
    else groups.push({ label, items: [thread] });
  }
  return groups;
}

function isSmallScreen() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}

export function ScoutAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14 rounded-2xl' : size === 'md' ? 'h-9 w-9 rounded-xl' : 'h-7 w-7 rounded-lg';
  return <ScoutLogo className={`${box} flex-none shadow-lg shadow-indigo-500/25`} />;
}

/**
 * The Scout conversation UI. `page` fills the /ai-command-center route with a
 * conversation sidebar; `panel` is the compact view inside the floating launcher.
 */
export default function AssistantChat({
  variant = 'page',
  active = true,
  onClose,
  onStateChange,
}: {
  variant?: 'page' | 'panel';
  active?: boolean;
  onClose?: () => void;
  onStateChange?: (state: AssistantChatState) => void;
}) {
  const panel = variant === 'panel';
  const [threads, setThreads] = useState<AiChatThread[]>([]);
  const [thread, setThread] = useState<ThreadDetail | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(!panel);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastConfirm, setLastConfirm] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState('');
  const [renamingId, setRenamingId] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [now] = useState(() => Date.now());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickRef = useRef(true);

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get });
  const needsGemini = Boolean(settings) && !settings?.geminiApiKey;

  const activeMessages = thread?.messages || [];
  const pendingAction = thread?.pendingAction || null;
  const selectedThreadId = thread?.id;
  const depthOptions = reasoningOptions.length ? reasoningOptions : DEPTH_FALLBACK;
  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? threads.filter((item) => item.title.toLowerCase().includes(query)) : threads;
  }, [search, threads]);
  const threadGroups = useMemo(() => groupThreads(filteredThreads, now), [filteredThreads, now]);

  useEffect(() => {
    let mounted = true;
    const requested = variant === 'page' ? new URLSearchParams(window.location.search).get('thread') : null;
    Promise.all([api.aiChat.models(), api.aiChat.threads()])
      .then(async ([modelData, threadData]) => {
        if (!mounted) return;
        setModels(modelData.models || []);
        setReasoningOptions(modelData.reasoningEfforts || []);
        setDefaultModel(modelData.defaultModel);
        setModel(modelData.defaultModel);
        setThreads(threadData || []);
        const first =
          threadData?.find((item) => item.id === requested) ||
          threadData?.[0] ||
          (await api.aiChat.createThread({ model: modelData.defaultModel }));
        if (!threadData?.length) setThreads([first]);
        const detail = await api.aiChat.getThread(first.id);
        if (mounted) {
          setThread(detail);
          setModel(detail.model || modelData.defaultModel);
          setReasoning(detail.reasoningEffort || 'medium');
        }
      })
      .catch((err: Error) => mounted && setError(err.message || `Could not load ${ASSISTANT_NAME}.`))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [variant]);

  // Follow new output only while the reader is already at the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !stickRef.current) return;
    list.scrollTo({ top: list.scrollHeight, behavior: streaming ? 'smooth' : 'auto' });
  }, [activeMessages.length, activities.length, streamText, streaming, pendingAction]);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`;
  }, [input]);

  useEffect(() => {
    onStateChange?.({ streaming, pending: Boolean(pendingAction) });
  }, [streaming, pendingAction, onStateChange]);

  useEffect(() => {
    if (active && !loading) inputRef.current?.focus();
  }, [active, loading]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < STICK_DISTANCE_PX;
    stickRef.current = atBottom;
    if (showJump === atBottom) setShowJump(!atBottom);
  };

  const jumpToLatest = () => {
    stickRef.current = true;
    setShowJump(false);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  };

  const closeListOnSmallViews = () => {
    if (panel || isSmallScreen()) setSidebarOpen(false);
  };

  const chooseThread = async (id: string) => {
    if (streaming || id === selectedThreadId) {
      closeListOnSmallViews();
      return;
    }
    setError('');
    try {
      const detail = await api.aiChat.getThread(id);
      stickRef.current = true;
      setThread(detail);
      setModel(detail.model || defaultModel);
      setReasoning(detail.reasoningEffort || 'medium');
      closeListOnSmallViews();
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
      closeListOnSmallViews();
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

  const addActivity = (label: string, tool?: string) => {
    setActivities((current) => [
      ...current.map((item) => (item.tool ? item : { ...item, done: true })),
      { id: `${label}-${Date.now()}-${Math.random()}`, tool, label },
    ]);
  };

  const completeActivity = (tool: string, failed: boolean) => {
    setActivities((current) => {
      const index = current.findIndex((item) => item.tool === tool && !item.done);
      if (index < 0) return current;
      return current.map((item, position) => (position === index ? { ...item, done: true, failed } : item));
    });
  };

  const sendMessage = async (value = input, confirm = false) => {
    if (!thread || streaming || (!value.trim() && !confirm)) return;
    const text = value.trim() || 'Confirm and execute the pending action.';
    let partial = '';
    stickRef.current = true;
    setShowJump(false);
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
        {
          content: text,
          model,
          reasoningEffort: reasoning,
          confirm,
          ...(confirm && pendingAction?.id ? { actionId: pendingAction.id } : {}),
        },
        controller.signal,
      );
      if (!response.body) throw new Error('The assistant returned an empty stream.');
      await readEvents(response, (event) => {
        if (event.type === 'delta') {
          partial += String(event.data.text || '');
          setStreamText(partial);
        }
        if (event.type === 'reset') {
          partial = '';
          setStreamText('');
        }
        if (event.type === 'status') addActivity(String(event.data.label || 'Working'));
        if (event.type === 'tool_start') {
          const name = String(event.data.name || 'workspace tool');
          addActivity(describeTool(name, asRecord(event.data.args) || {}), name);
        }
        if (event.type === 'tool_result') {
          completeActivity(String(event.data.name || 'workspace tool'), typeof asRecord(event.data.result)?.error === 'string');
        }
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
        setError('Stopped. You can retry the last request.');
        if (partial.trim()) {
          setThread((current) =>
            current
              ? { ...current, messages: [...current.messages, { id: `local-stopped-${Date.now()}`, threadId: current.id, role: 'assistant', content: `${partial.trim()}\n\n_Stopped._` }] }
              : current,
          );
        }
      } else {
        setError(streamError.message);
        if (!confirm) setInput(text);
      }
      setStreamText('');
      setInterrupted(true);
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const stop = () => abortRef.current?.abort();

  const copyMessage = async (message: AiChatMessage) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId(''), 1600);
  };

  const fillPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const hasConversation = activeMessages.some((message) => message.role === 'user' || message.role === 'assistant' || message.role === 'tool');
  const statusChip = streaming
    ? { label: 'Working…', className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200' }
    : pendingAction
      ? { label: 'Waiting for your confirmation', className: 'border-amber-500/30 bg-amber-500/10 text-amber-200' }
      : thread?.status === 'error'
        ? { label: 'Needs attention', className: 'border-rose-500/30 bg-rose-500/10 text-rose-200' }
        : null;

  if (loading) {
    return (
      <div className={`flex items-center justify-center text-sm text-zinc-400 ${panel ? 'h-full' : 'min-h-[70vh]'}`}>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading {ASSISTANT_NAME}…
      </div>
    );
  }

  const depthSelect = (
    <select
      value={reasoning}
      onChange={(event) => void updatePreference({ reasoningEffort: event.target.value as AiChatReasoningEffort })}
      aria-label="Research depth"
      title={depthOptions.find((item) => item.value === reasoning)?.description || 'How much research to do before answering'}
      className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 outline-none focus:border-indigo-500/60"
    >
      {depthOptions.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label} depth
        </option>
      ))}
    </select>
  );

  const threadList = (
    <div className={`flex h-full flex-col p-3 ${panel ? 'w-full' : 'w-72 sm:w-64'}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => void newThread()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20"
        >
          <MessageSquarePlus className="h-4 w-4" /> New conversation
        </button>
        {panel && (
          <button onClick={() => setSidebarOpen(false)} aria-label="Close conversations" className="rounded-lg p-2.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search conversations"
          placeholder="Search conversations"
          className="w-full rounded-lg border border-zinc-850 bg-zinc-900/60 py-2 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/50"
        />
      </div>
      <div className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {threadGroups.length ? (
          threadGroups.map((group) => (
            <div key={group.label}>
              <p className="sig-label px-2 pb-1 text-zinc-600">{group.label.toUpperCase()}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-1 rounded-lg ${item.id === selectedThreadId ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/70'}`}
                  >
                    {renamingId === item.id ? (
                      <input
                        autoFocus
                        value={titleDraft}
                        onChange={(event) => setTitleDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') void saveTitle(item.id);
                          if (event.key === 'Escape') setRenamingId('');
                        }}
                        onBlur={() => void saveTitle(item.id)}
                        className="min-w-0 flex-1 rounded bg-zinc-800 px-2 py-1.5 text-xs text-white outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => void chooseThread(item.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <span className="truncate">{item.title}</span>
                        {item.status === 'running' ? (
                          <Loader2 className="h-3 w-3 flex-none animate-spin text-indigo-300" aria-label="Working" />
                        ) : item.hasPendingAction ? (
                          <span className="h-1.5 w-1.5 flex-none rounded-full bg-amber-400" title="Waiting for your confirmation" />
                        ) : item.status === 'error' ? (
                          <span className="h-1.5 w-1.5 flex-none rounded-full bg-rose-400" title="Needs attention" />
                        ) : null}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRenamingId(item.id);
                        setTitleDraft(item.title);
                      }}
                      aria-label={`Rename ${item.title}`}
                      title="Rename conversation"
                      className="rounded p-1.5 text-zinc-600 opacity-0 hover:text-zinc-300 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => void deleteThread(item.id)}
                      aria-label={`Delete ${item.title}`}
                      title="Delete conversation"
                      className="mr-1 rounded p-1.5 text-zinc-600 opacity-0 hover:text-rose-400 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="px-3 py-4 text-xs text-zinc-600">No conversations found.</p>
        )}
      </div>
      {!panel && (
        <div className="mt-3 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3 text-[11px] leading-5 text-zinc-500">
          <ShieldCheck className="mb-1 h-4 w-4 text-emerald-400" />
          {ASSISTANT_NAME} researches your workspace and shows an editable preview before any outreach is launched.
        </div>
      )}
    </div>
  );

  return (
    <div
      className={
        panel
          ? 'relative flex h-full min-h-0 overflow-hidden bg-zinc-950'
          : 'relative flex h-[calc(100dvh-6.5rem)] min-h-120 overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950/60 shadow-2xl sm:h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-4rem)]'
      }
    >
      {panel ? (
        sidebarOpen && <div className="absolute inset-0 z-30 bg-zinc-950">{threadList}</div>
      ) : (
        <>
          {sidebarOpen && <button aria-label="Close conversations" onClick={() => setSidebarOpen(false)} className="absolute inset-0 z-20 bg-black/50 sm:hidden" />}
          <aside
            className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:-ml-64'} absolute inset-y-0 left-0 z-30 flex w-72 flex-none transform overflow-hidden border-r border-zinc-850 bg-zinc-950/95 transition-transform duration-200 sm:relative sm:z-auto sm:w-64 sm:bg-zinc-950/80`}
          >
            {threadList}
          </aside>
        </>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className={`flex items-center justify-between gap-3 border-b border-zinc-850 ${panel ? 'px-3 py-2.5' : 'px-4 py-3 sm:px-6'}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            {!panel && (
              <button
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label="Toggle conversations"
                title="Toggle conversations"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
            )}
            <ScoutAvatar size={panel ? 'sm' : 'md'} />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white">{ASSISTANT_NAME}</h1>
              <p className="truncate text-[11px] text-zinc-500">
                {panel && statusChip ? statusChip.label : panel ? ASSISTANT_TAGLINE : `${ASSISTANT_TAGLINE} for research, contacts, campaigns, and Signals`}
              </p>
            </div>
          </div>
          {panel ? (
            <div className="flex items-center gap-0.5">
              <button onClick={() => setSidebarOpen(true)} aria-label="Conversations" title="Conversations" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200">
                <History className="h-4 w-4" />
              </button>
              <button
                onClick={() => void newThread()}
                disabled={streaming}
                aria-label="New conversation"
                title="New conversation"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              {streaming ? (
                <span className="rounded-lg p-2 text-zinc-700" title={`Available when ${ASSISTANT_NAME} finishes`}>
                  <Maximize2 className="h-4 w-4" />
                </span>
              ) : (
                <Link
                  href={thread ? `/ai-command-center?thread=${thread.id}` : '/ai-command-center'}
                  onClick={onClose}
                  aria-label="Open full view"
                  title="Open full view"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
              )}
              {onClose && (
                <button onClick={onClose} aria-label={`Close ${ASSISTANT_NAME}`} title="Close" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {statusChip && (
                <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold md:flex ${statusChip.className}`}>
                  {streaming && <Loader2 className="h-3 w-3 animate-spin" />}
                  {statusChip.label}
                </span>
              )}
              <select
                value={model}
                onChange={(event) => void updatePreference({ model: event.target.value })}
                aria-label="Model"
                className="hidden rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 outline-none focus:border-indigo-500/60 lg:block"
              >
                {(models.length ? models : [{ value: defaultModel, label: defaultModel }]).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {depthSelect}
            </div>
          )}
        </header>

        <div className="relative min-h-0 flex-1">
          <div ref={listRef} onScroll={onScroll} className={`h-full overflow-y-auto ${panel ? 'px-3 py-4' : 'px-4 py-6 sm:px-8'}`}>
            {!hasConversation && !streaming ? (
              <EmptyState panel={panel} needsGemini={needsGemini} onSuggestion={fillPrompt} />
            ) : (
              <div className={`mx-auto w-full space-y-5 ${panel ? '' : 'max-w-4xl'}`}>
                {activeMessages.map((message) =>
                  message.role === 'tool' ? (
                    <div key={message.id} className={panel ? '' : 'pl-10'}>
                      <ToolArtifact message={message} onPrompt={fillPrompt} />
                    </div>
                  ) : (
                    <MessageRow
                      key={message.id}
                      message={message}
                      copied={copiedMessageId === message.id}
                      onCopy={() => void copyMessage(message)}
                    />
                  ),
                )}
                {streaming && (
                  <div className="flex gap-3">
                    <ScoutAvatar size="sm" />
                    <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                      {activities.length > 0 && <ActivityPanel activities={activities} />}
                      {streamText ? (
                        <div>
                          <AssistantMarkdown content={streamText} />
                          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-indigo-400 align-middle" />
                        </div>
                      ) : (
                        !activities.length && <ThinkingDots />
                      )}
                    </div>
                  </div>
                )}
                {error && (
                  <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
                    <span>{error}</span>
                    {interrupted && lastPrompt && (
                      <button
                        onClick={() => void sendMessage(lastPrompt, lastConfirm)}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Retry
                      </button>
                    )}
                  </div>
                )}
                {pendingAction && !streaming && (
                  <ConfirmationCard
                    action={pendingAction}
                    onConfirm={() => void sendMessage('Confirm launch', true)}
                    onCancel={() => void sendMessage('Cancel', false)}
                  />
                )}
              </div>
            )}
          </div>
          {showJump && (
            <button
              onClick={jumpToLatest}
              aria-label="Jump to latest"
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/95 px-3 py-1.5 text-[11px] font-semibold text-zinc-300 shadow-xl hover:text-white"
            >
              <ArrowDown className="h-3.5 w-3.5" /> Latest
            </button>
          )}
        </div>

        <div className={`border-t border-zinc-850 ${panel ? 'p-3' : 'p-4 sm:px-8'}`}>
          <div className={panel ? '' : 'mx-auto max-w-4xl'}>
            {needsGemini && hasConversation && <GeminiNotice compact />}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl focus-within:border-indigo-500/50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={streaming}
                rows={1}
                placeholder={`Ask ${ASSISTANT_NAME} about outreach, contacts, campaigns, inbox, or Signals…`}
                className="block w-full resize-none bg-transparent px-4 pt-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-60"
              />
              <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  {panel && depthSelect}
                  <span className="hidden truncate text-[10px] text-zinc-600 sm:inline">Enter to send · Shift + Enter for a new line</span>
                </div>
                {streaming ? (
                  <button
                    onClick={stop}
                    className="flex flex-none items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Square className="h-3 w-3 fill-current" /> Stop
                  </button>
                ) : (
                  <button
                    onClick={() => void sendMessage()}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex flex-none items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                )}
              </div>
            </div>
            {!panel && (
              <p className="mt-2 text-center text-[10px] text-zinc-600">
                {ASSISTANT_NAME} can make mistakes. Review Signal evidence and campaign previews before anything is sent.
              </p>
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {streaming ? `${ASSISTANT_NAME} is working` : ''}
        </p>
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

function GeminiNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 text-left ${compact ? 'mb-3 px-3 py-2.5' : 'mt-6 w-full max-w-lg px-4 py-3'}`}>
      <KeyRound className="mt-0.5 h-4 w-4 flex-none text-amber-300" />
      <div className="text-xs leading-5 text-zinc-400">
        <p className="font-semibold text-amber-200">Connect Gemini to unlock {ASSISTANT_NAME}</p>
        Without a Gemini key, {ASSISTANT_NAME} can only show raw workspace data.{' '}
        <Link href="/settings" className="font-semibold text-amber-200 underline underline-offset-2 hover:text-white">
          Open Settings
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ panel, needsGemini, onSuggestion }: { panel: boolean; needsGemini: boolean; onSuggestion: (value: string) => void }) {
  const suggestions = panel ? SUGGESTIONS.slice(0, 4) : SUGGESTIONS;
  return (
    <div className={`flex flex-col items-center justify-center text-center ${panel ? 'min-h-full py-4' : 'min-h-[48vh]'}`}>
      <ScoutAvatar size="lg" />
      <h2 className={`mt-5 font-black tracking-tight text-white ${panel ? 'text-xl' : 'text-2xl'}`}>Hi, I&apos;m {ASSISTANT_NAME}</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
        I can find contacts and hiring companies, read your Signals, inbox and metrics, and draft campaigns for you to review before anything is sent.
      </p>
      {needsGemini && <GeminiNotice />}
      <div className={`mt-6 grid w-full gap-2 ${panel ? 'max-w-sm' : 'max-w-3xl sm:grid-cols-2 lg:grid-cols-3'}`}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => onSuggestion(suggestion.prompt)}
            className="flex items-center gap-3 rounded-xl border border-zinc-850 bg-zinc-900/50 px-4 py-3 text-left text-xs text-zinc-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <suggestion.icon className="h-4 w-4 flex-none text-indigo-400" />
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageRow({ message, copied, onCopy }: { message: AiChatMessage; copied: boolean; onCopy: () => void }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl rounded-br-md bg-indigo-500 px-4 py-2.5 text-sm leading-6 text-white shadow-lg shadow-indigo-500/10">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="group flex gap-3">
      <ScoutAvatar size="sm" />
      <div className="min-w-0 flex-1 pt-0.5">
        <AssistantMarkdown content={message.content} />
        <button
          onClick={onCopy}
          className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-600 opacity-0 transition hover:text-zinc-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group-hover:opacity-100"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2" aria-label="Thinking">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  );
}

function ActivityPanel({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 px-3.5 py-3 text-xs">
      <div className="space-y-1.5">
        {activities.slice(-6).map((activity) => (
          <div key={activity.id} className="flex items-center gap-2">
            <span className={activity.failed ? 'text-rose-400' : activity.done ? 'text-emerald-400' : 'text-indigo-400'}>
              {activity.failed ? <X className="h-3.5 w-3.5" /> : activity.done ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </span>
            <span className={activity.done ? 'text-zinc-500' : 'text-zinc-300'}>{activity.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmationCard({ action, onConfirm, onCancel }: { action: NonNullable<AiChatThread['pendingAction']>; onConfirm: () => void; onCancel: () => void }) {
  const signalReview = action.kind === 'review_signal_match';
  const calling = action.kind === 'launch_calling_campaign';
  const title = signalReview ? `${action.action === 'reject' ? 'Reject' : 'Approve'} Signal action` : `Ready to launch ${calling ? 'calling' : 'email'} campaign`;
  const details = signalReview
    ? `${action.signalTitle || 'Signal'} · ${action.companyName || 'Company'} · ${action.contactName || 'Contact'}${action.playbookName ? ` · ${action.playbookName}` : ''}`
    : `${action.campaignName || 'Campaign'} · ${action.contactCount || 0} contact(s)`;
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-amber-500/15 p-2 text-amber-300">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {details}. Review the preview above. {signalReview && action.action === 'approve' ? 'This may start external outreach.' : 'This action cannot be undone.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onConfirm}
              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {signalReview ? (action.action === 'reject' ? 'Reject action' : 'Approve and launch') : 'Confirm launch'}
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              {signalReview ? 'Cancel' : 'Cancel and discard draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
