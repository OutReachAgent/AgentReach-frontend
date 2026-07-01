"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

const CUBE_FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

interface Loader3DProps {
  /** Overall scene size in pixels. */
  size?: number;
  className?: string;
}

/**
 * Core 3D visual: a glass gradient cube spinning inside three gyroscope
 * rings with orbiting particles and the ReachConvert bolt at its core.
 * All motion lives in globals.css (`l3d-*`) and respects reduced motion.
 */
export function Loader3D({ size = 120, className = "" }: Loader3DProps) {
  const cube = Math.round(size * 0.42);
  const core = Math.max(Math.round(size * 0.26), 24);

  return (
    <div
      className={`l3d-scene ${className}`}
      style={{
        width: size,
        height: size,
        ["--l3d-cube" as string]: `${cube}px`,
      }}
      aria-hidden="true"
    >
      <div className="l3d-ring l3d-ring-a" />
      <div className="l3d-ring l3d-ring-b" />
      <div className="l3d-ring l3d-ring-c" />

      <div className="l3d-orbit">
        <span className="l3d-dot" />
      </div>
      <div className="l3d-orbit l3d-orbit-2">
        <span className="l3d-dot l3d-dot-pink" />
      </div>

      <div className="l3d-cube">
        {CUBE_FACES.map((face) => (
          <div key={face} className={`l3d-face l3d-face-${face}`} />
        ))}
      </div>

      <div className="l3d-core">
        <div
          className="animate-pulse-glow flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30"
          style={{ width: core, height: core }}
        >
          <Zap
            className="text-white"
            style={{ width: core * 0.55, height: core * 0.55 }}
          />
        </div>
      </div>
    </div>
  );
}

function TickDots() {
  return (
    <span className="inline-flex">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className="l3d-tick"
          style={{ animationDelay: `${delay}ms` }}
        >
          .
        </span>
      ))}
    </span>
  );
}

interface LoaderOverlayProps {
  /** Mount/unmount the overlay. Keep it bound to a mutation's `isPending`. */
  show: boolean;
  label: string;
  sublabel?: string;
}

/**
 * Full-screen blocking loader for in-flight actions (launch / relaunch
 * campaign, etc.). Blurs the app, locks scroll, and announces politely.
 */
export function LoaderOverlay({ show, label, sublabel }: LoaderOverlayProps) {
  useEffect(() => {
    if (!show) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="l3d-overlay fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="l3d-panel relative mx-4 flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 px-10 py-9 shadow-2xl">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

        <Loader3D size={130} />

        <p className="mt-6 text-base font-bold tracking-tight text-white">
          {label}
          <TickDots />
        </p>
        {sublabel && (
          <p className="mt-1.5 text-center text-xs leading-5 text-zinc-400">
            {sublabel}
          </p>
        )}

        <div className="l3d-progress-track mt-6">
          <div className="l3d-progress-bar" />
        </div>
      </div>
    </div>
  );
}

interface PageLoaderProps {
  label?: string;
  sublabel?: string;
}

/**
 * In-content loader for page renders that have no skeleton state.
 */
export function PageLoader({ label = "Loading", sublabel }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader3D size={110} />
      <p className="mt-5 text-sm font-bold tracking-tight text-white">
        {label}
        <TickDots />
      </p>
      {sublabel && <p className="mt-1 text-xs text-zinc-500">{sublabel}</p>}
    </div>
  );
}

export default Loader3D;
