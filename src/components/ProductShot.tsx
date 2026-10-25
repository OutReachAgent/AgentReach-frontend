import Image from 'next/image';
import { SCREENS, type ScreenName } from '@/lib/screens';

/** A product screenshot in a browser frame, labelled as demo data. */
export default function ProductShot({
  name,
  hero = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className = '',
}: {
  name: ScreenName;
  /** Above the fold: load it first instead of lazily. */
  hero?: boolean;
  sizes?: string;
  className?: string;
}) {
  const screen = SCREENS[name];
  return (
    <figure className={`sig-card overflow-hidden rounded-2xl p-0 shadow-2xl ${className}`}>
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-[11px] text-zinc-500">reachconvert.site{screen.path}</span>
        <span className="sig-label ml-auto shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-400">
          DEMO DATA
        </span>
      </div>
      <Image
        src={screen.image}
        alt={screen.alt}
        sizes={sizes}
        placeholder="blur"
        className="block h-auto w-full"
        {...(hero ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
      />
    </figure>
  );
}
