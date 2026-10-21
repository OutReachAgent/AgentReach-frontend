'use client';

import { useId } from 'react';

const LENS = 'M29 20.5c.9 4.6 3.9 7.6 8.5 8.5-4.6.9-7.6 3.9-8.5 8.5-.9-4.6-3.9-7.6-8.5-8.5 4.6-.9 7.6-3.9 8.5-8.5z';

/**
 * Scout's mark: a search lens with an AI spark and an amber signal dot.
 * `tile` draws it on the gradient tile (same art as /public/scout-logo.svg);
 * without it only the white glyph is drawn, for use on a gradient button.
 */
export function ScoutLogo({ className, tile = true }: { className?: string; tile?: boolean }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      {tile && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="6" y1="58" x2="58" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4F46E5" />
              <stop offset="0.55" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#C026D3" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
        </>
      )}
      <circle cx="29" cy="29" r="15" fill="none" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M40.5 40.5 50 50" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <path d={LENS} fill="#FFFFFF" />
      <circle cx="50" cy="14" r="4" fill="#FCD34D" />
    </svg>
  );
}
