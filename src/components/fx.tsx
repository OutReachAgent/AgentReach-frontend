'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';

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
/* BrandMark — the ReachConvert paper-plane logomark.                  */
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
        borderRadius: size * 0.24,
      }}
      aria-hidden="true"
    >
      <Image
        src="/reachconvert-icon.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
        draggable={false}
        unoptimized
      />
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
