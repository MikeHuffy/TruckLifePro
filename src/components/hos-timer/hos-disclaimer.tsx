'use client';

/**
 * HOS disclaimer (FR9) — must render on every surface that displays the
 * HOS countdown. Architectural rule: never let the timer be misread as
 * an ELD (49 CFR Part 395).
 */
export function HosDisclaimer() {
  return (
    <p
      role="note"
      className="mt-2 text-xs text-neutral-600 leading-snug"
      data-testid="hos-disclaimer"
    >
      <strong className="font-semibold">Informational only. Not an ELD.</strong>{' '}
      You remain responsible for your own HOS compliance.
    </p>
  );
}
