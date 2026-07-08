'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDocsByTrackAndCategory } from '@/lib/docs';
import { DOC_ICON_MAP } from './docIcons';
import { BookOpen, Menu, X } from 'lucide-react';

export default function DocSidebar() {
  const pathname = usePathname();
  const tracks = getDocsByTrackAndCategory();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-6">
      <Link
        href="/documentation"
        onClick={() => setOpen(false)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          pathname === '/documentation'
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <BookOpen className="h-4 w-4" /> Overview
      </Link>

      {tracks.map((track) => (
        <div key={track.track} className="space-y-3">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
            {track.track}
          </p>
          {track.groups.map((group) => (
            <div key={`${track.track}-${group.category}`}>
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {group.category}
              </p>
              <div className="space-y-0.5">
                {group.docs.map((doc) => {
                  const Icon = DOC_ICON_MAP[doc.icon];
                  const href = `/documentation/${doc.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={doc.slug}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-zinc-900 font-semibold text-white'
                          : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 flex-none ${active ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                      />
                      <span className="truncate">{doc.title.split(' — ')[0]}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 lg:hidden"
        aria-label="Toggle docs navigation"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-none overflow-y-auto border-r border-zinc-900 px-4 py-8 lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-zinc-800 bg-zinc-950 px-4 py-8">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
