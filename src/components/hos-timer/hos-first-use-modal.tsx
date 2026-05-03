'use client';

import { useState } from 'react';
import { useHosDisclaimerAck } from '@/lib/hooks/use-hos-timer';

/**
 * HOS first-use legal modal (FR9, Story 2.4).
 *
 * Renders before the driver can interact with the HOS timer for the first
 * time. Requires explicit acknowledgement that the timer is informational
 * only and the driver is responsible for compliance. Acknowledgement is
 * persisted in localStorage so the modal does not reappear in subsequent
 * sessions.
 *
 * Renders nothing if the driver has already acknowledged.
 */
export function HosFirstUseModal() {
  const { acknowledged, acknowledge } = useHosDisclaimerAck();
  const [checked, setChecked] = useState(false);

  if (acknowledged) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hos-modal-title"
      aria-describedby="hos-modal-body"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      data-testid="hos-first-use-modal"
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 id="hos-modal-title" className="text-xl font-semibold text-neutral-900">
          Before you use the HOS timer
        </h2>
        <div id="hos-modal-body" className="mt-3 space-y-3 text-sm text-neutral-700">
          <p>
            <strong>This timer is informational only.</strong> It is{' '}
            <strong>not</strong> an Electronic Logging Device (ELD) and is not
            certified for FMCSA compliance under 49 CFR Part 395.
          </p>
          <p>
            You — the driver — are solely responsible for tracking your Hours
            of Service and remaining compliant with all applicable regulations.
          </p>
          <p>
            Use this tool as a quick visual reference at search time, not as
            your record of duty status.
          </p>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            data-testid="hos-modal-ack-checkbox"
          />
          <span>
            I understand this is informational only and I am responsible for my
            own HOS compliance.
          </span>
        </label>

        <button
          type="button"
          disabled={!checked}
          onClick={acknowledge}
          className="mt-5 w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-semibold text-white disabled:bg-neutral-300 disabled:cursor-not-allowed"
          data-testid="hos-modal-continue"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
