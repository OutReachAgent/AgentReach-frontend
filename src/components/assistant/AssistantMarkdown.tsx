'use client';

import Link from 'next/link';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LONG_BLOCK_CHARS = 1200;

type HastNode = { value?: string; children?: HastNode[] };

function textLength(node?: HastNode): number {
  if (!node) return 0;
  return (node.value?.length || 0) + (node.children || []).reduce((sum, child) => sum + textLength(child), 0);
}

const LINK_CLASS = 'font-medium text-indigo-300 underline decoration-indigo-500/40 underline-offset-2 hover:text-indigo-200';
const PRE_CLASS =
  'my-3 max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs leading-5 text-zinc-300 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit';

const COMPONENTS: Components = {
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link href={href} className={LINK_CLASS}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>{children}</a>
    ),
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 marker:text-zinc-600">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-zinc-500">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  h1: ({ children }) => <h3 className="mb-1.5 mt-4 text-base font-bold text-white first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-1.5 mt-4 text-sm font-bold text-white first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-white first:mt-0">{children}</h4>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-indigo-500/40 pl-3 text-zinc-400">{children}</blockquote>,
  hr: () => <hr className="my-4 border-zinc-800" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-500">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-zinc-850 px-3 py-2 align-top text-zinc-300">{children}</td>,
  code: ({ className, children }) => (
    <code className={className || 'rounded bg-zinc-800/80 px-1 py-0.5 text-[0.85em] text-indigo-200'}>{children}</code>
  ),
  // Long data dumps (for example raw workspace data) start collapsed.
  pre: ({ node, children }) =>
    textLength(node as HastNode) > LONG_BLOCK_CHARS ? (
      <details className="my-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200">Show data</summary>
        <pre className={`${PRE_CLASS} my-0 rounded-none border-0 border-t`}>{children}</pre>
      </details>
    ) : (
      <pre className={PRE_CLASS}>{children}</pre>
    ),
};

/** Renders assistant Markdown (GitHub flavored, no raw HTML) with app styling. */
export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-6 text-zinc-200 [overflow-wrap:anywhere]">
      <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}
