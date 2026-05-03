'use client';

import { useId, useState } from 'react';
import { useHosTimer } from '@/lib/hooks/use-hos-timer';
import type { DutyStatus } from '@/types/hos';

const DUTY_STATUS_OPTIONS: { value: DutyStatus; label: string }[] = [
  { value: 'driving', label: 'Driving' },
  { value: 'on-duty-not-driving', label: 'On-duty (not driving)' },
  { value: 'off-duty', label: 'Off-duty' },
  { value: 'sleeper-berth', label: 'Sleeper berth' },
];

/** ISO datetime → value attribute for `<input type="datetime-local">`. */
function isoToLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** `<input type="datetime-local">` value → ISO string. */
function localInputValueToIso(value: string): string {
  // datetime-local has no timezone; treat as local then convert to ISO UTC.
  return new Date(value).toISOString();
}

/**
 * HOS set/reset form (Story 2.3, FR6 + FR8).
 *
 * Driver enters shift-start time and current duty status; submit persists
 * to localStorage via useHosTimer. Reset clears the timer entirely.
 */
export function HosTimerForm() {
  const { state, setTimer, reset } = useHosTimer();
  const shiftId = useId();
  const dutyId = useId();

  const [shiftStartLocal, setShiftStartLocal] = useState(() =>
    state ? isoToLocalInputValue(state.shiftStartIso) : isoToLocalInputValue(new Date().toISOString()),
  );
  const [dutyStatus, setDutyStatus] = useState<DutyStatus>(
    state?.dutyStatus ?? 'driving',
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!shiftStartLocal) {
      setError('Shift start time is required.');
      return;
    }
    try {
      const iso = localInputValueToIso(shiftStartLocal);
      setTimer({ shiftStartIso: iso, dutyStatus });
    } catch {
      setError('Invalid shift start time.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-testid="hos-timer-form"
    >
      <div>
        <label htmlFor={shiftId} className="block text-sm font-medium text-neutral-800">
          Shift start time
        </label>
        <input
          id={shiftId}
          type="datetime-local"
          required
          value={shiftStartLocal}
          onChange={(e) => setShiftStartLocal(e.target.value)}
          className="mt-1 block w-full min-h-[48px] rounded-lg border border-neutral-300 px-3 text-base"
          data-testid="hos-shift-input"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-neutral-800">
          Current duty status
        </legend>
        <div id={dutyId} className="mt-2 space-y-2">
          {DUTY_STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex min-h-[48px] items-center gap-3 rounded-lg border border-neutral-300 px-3 text-base"
            >
              <input
                type="radio"
                name="dutyStatus"
                value={opt.value}
                checked={dutyStatus === opt.value}
                onChange={() => setDutyStatus(opt.value)}
                className="h-5 w-5"
                data-testid={`hos-duty-${opt.value}`}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error !== null && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-700"
          data-testid="hos-form-error"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="min-h-[48px] flex-1 rounded-lg bg-neutral-900 px-4 text-base font-semibold text-white"
          data-testid="hos-submit"
        >
          {state ? 'Update timer' : 'Set timer'}
        </button>
        {state !== null && (
          <button
            type="button"
            onClick={reset}
            className="min-h-[48px] rounded-lg border border-neutral-300 px-4 text-base font-medium text-neutral-700"
            data-testid="hos-reset"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
