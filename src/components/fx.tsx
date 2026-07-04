'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/* TiltCard — pointer-tracked 3D tilt with a moving glare highlight.  */
/* Pairs with the .tilt-* styles in globals.css.                      */
/* ------------------------------------------------------------------ */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  strength?: number;
  style?: CSSProperties;
}

export function TiltCard({ children, className = '', strength = 7, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || event.pointerType === 'touch') return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--ry', `${(px - 0.5) * strength * 2}deg`);
    node.style.setProperty('--rx', `${(0.5 - py) * strength * 2}deg`);
    node.style.setProperty('--gx', `${px * 100}%`);
    node.style.setProperty('--gy', `${py * 100}%`);
  };

  const onLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      className={`tilt-scene ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={style}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp — animates a numeric value when it scrolls into view.      */
/* Accepts "3.2M+", "42%", "12,000" style strings.                    */
/* ------------------------------------------------------------------ */

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

export function CountUp({ value, duration = 1400, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = value.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const useGrouping = num.includes(',');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const frame = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = target * eased;
          const text = current.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping,
          });
          setDisplay(`${prefix}${text}${suffix}`);
          if (t < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* BrandMark — the ReachConvert "beacon" logomark: concentric signal  */
/* arcs radiating from a transmitting node.                           */
/* ------------------------------------------------------------------ */

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 36, className = '' }: BrandMarkProps) {
  return (
    <div
      className={`relative flex flex-none items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background:
          'linear-gradient(140deg, var(--a-500), color-mix(in oklab, var(--a-500) 55%, var(--a2-500)))',
        boxShadow:
          '0 6px 18px -6px color-mix(in oklab, var(--a-500) 55%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--on-accent)"
        strokeWidth="2.1"
        strokeLinecap="round"
      >
        {/* beacon node */}
        <circle cx="7.5" cy="16.5" r="2.1" fill="var(--on-accent)" stroke="none" />
        {/* radiating arcs */}
        <path d="M11.5 12.5a5.7 5.7 0 0 1 1.7 4" />
        <path d="M14.4 9.6a9.8 9.8 0 0 1 2.9 6.9" />
        <path d="M17.3 6.7a13.9 13.9 0 0 1 4.1 9.8" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand — logomark + wordmark lockup.                                */
/* ------------------------------------------------------------------ */

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark size={compact ? 32 : 36} />
      <span className="leading-tight">
        <span className="sig-display block text-lg font-bold tracking-tight text-white">
          ReachConvert
        </span>
        {!compact && (
          <span className="sig-label block text-zinc-500">AI Outreach Suite</span>
        )}
      </span>
    </span>
  );
}
