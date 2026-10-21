'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import AssistantChat, { ASSISTANT_NAME } from './AssistantChat';
import { ScoutLogo } from './ScoutLogo';
import type { AssistantChatState } from './AssistantChat';

const FULL_VIEW_PATH = '/ai-command-center';

/**
 * Floating Scout button in the bottom-right corner of every dashboard page.
 * The chat mounts on first open and then stays mounted while hidden, so a
 * running answer and the open conversation survive closing the panel and
 * moving between pages.
 */
export default function AssistantLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chatState, setChatState] = useState<AssistantChatState>({ streaming: false, pending: false });
  const panelRef = useRef<HTMLDivElement>(null);
  const onFullView = pathname?.startsWith(FULL_VIEW_PATH) ?? false;
  const visible = open && !onFullView;

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelRef.current?.contains(document.activeElement)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const toggle = () => {
    setMounted(true);
    setOpen((current) => !current);
  };

  const attention = !visible && (chatState.streaming || chatState.pending);

  return (
    <>
      {mounted && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={ASSISTANT_NAME}
          inert={!visible}
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50 transition duration-200 ease-out sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(720px,calc(100dvh-8rem))] sm:w-110 sm:rounded-2xl sm:border ${
            visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          <AssistantChat variant="panel" active={visible} onClose={() => setOpen(false)} onStateChange={setChatState} />
        </div>
      )}

      {!onFullView && (
        <div className="group fixed bottom-5 right-5 z-30 flex items-center gap-3">
          {!visible && (
            <span className="pointer-events-none hidden rounded-lg border border-zinc-800 bg-zinc-900/95 px-2.5 py-1 text-xs font-semibold text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100 sm:block">
              {chatState.pending ? `${ASSISTANT_NAME} is waiting for you` : chatState.streaming ? `${ASSISTANT_NAME} is working…` : `Ask ${ASSISTANT_NAME}`}
            </span>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={visible ? `Close ${ASSISTANT_NAME}` : `Ask ${ASSISTANT_NAME}`}
            aria-expanded={visible}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 transition hover:scale-105 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              visible ? 'max-sm:hidden' : ''
            }`}
          >
            {visible ? <X className="h-6 w-6" /> : <ScoutLogo tile={false} className="h-9 w-9" />}
            {attention && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
