'use client';

import { useEffect, useState } from 'react';
import { useHosTimer } from '@/lib/hooks/use-hos-timer';
import { computeRemaining, formatRemaining } from '@/lib/hos/calculations';
import { HosDisclaimer } from './hos-disclaimer';

/**
 * HOS countdown display (Story 2.2, FR7).
 *
 * Shows live-updating remaining time when the driver has set the timer.
 * Renders a placeholder + CTA when not set (consumer should render
 * HosTimerForm below — the form handles its own gating).
 *
 * HosDisclaimer (FR9) renders directly below the countdown — always.
 */
export function HosTimer() {
  const { state } = useHosTimer();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!state) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  if (!state) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-center">
        <p className="text-sm text-neutral-600" data-testid="hos-placeholder">
          Set your timer to track remaining HOS hours.
        </p>
        <HosDisclaimer />
      </div>
    );
  }

  const remaining = computeRemaining(state, now);
  const colorClass =
    remaining.warningLevel === 'red'
      ? 'text-red-700'
      : remaining.warningLevel === 'amber'
        ? 'text-amber-700'
        : 'text-neutral-900';

  return (
    <div
      className="rounded-lg border border-neutral-300 p-4"
      data-testid="hos-timer-display"
    >
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        Remaining ({remaining.limit === 'drive-11h' ? 'drive limit' : 'shift limit'})
      </p>
      <p
        className={`mt-1 font-mono text-4xl font-semibold tabular-nums ${colorClass}`}
        aria-live="polite"
        data-testid="hos-countdown"
      >
        {formatRemaining(remaining.remainingMs)}
      </p>
      {remaining.exceeded && (
        <p
          className="mt-1 text-sm font-semibold text-red-700"
          data-testid="hos-exceeded"
        >
          Off-duty required
        </p>
      )}
      <HosDisclaimer />
    </div>
  );
}
