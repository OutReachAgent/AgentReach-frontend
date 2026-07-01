import Link from 'next/link';
import { getDocsByCategory } from '@/lib/docs';
import { DOC_ICON_MAP } from './docIcons';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function DocumentationIndex() {
  const groups = getDocsByCategory();

  return (
    <div className="mx-auto max-w-4xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Documentation
      </span>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white">
        Everything you can do with ReachConvert
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
        Detailed guides for every feature — from importing contacts and launching campaigns to
        autonomous AI calling and signal-based outreach that triggers itself. Pick a topic to dive in.
      </p>

      <div className="mt-12 space-y-12">
        {groups.map((group) => (
          <section key={group.category}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.docs.map((doc) => {
                const Icon = DOC_ICON_MAP[doc.icon];
                return (
                  <Link
                    key={doc.slug}
                    href={`/documentation/${doc.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-zinc-850 bg-zinc-900/40 p-5 shadow-xl transition-all hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-1.5 text-base font-bold text-white">
                        {doc.title.split(' — ')[0]}
                        <ArrowRight className="h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{doc.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
