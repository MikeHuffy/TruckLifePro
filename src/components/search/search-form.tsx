'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

const US_STATE_REGEX = /^[A-Z]{2}$/;

/**
 * Search form (Story 1.7, FR1).
 *
 * Two inputs (exit + state), one submit button. Submit navigates to
 * `/search?exit=<exit>&state=<state>` — the search-results page (Story 1.8)
 * does the actual API call.
 *
 * Mobile-first: ≥ 48px tap targets per NFR-A2; bottom-anchored primary
 * action so it sits in the single-thumb arc per FR27.
 */
export function SearchForm() {
  const router = useRouter();
  const exitId = useId();
  const stateId = useId();

  const [exit, setExit] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedExit = exit.trim();
    const upperState = stateCode.trim().toUpperCase();

    if (!trimmedExit) {
      setError('Enter an exit number.');
      return;
    }
    if (!US_STATE_REGEX.test(upperState)) {
      setError('Enter a 2-letter US state code (e.g., IA).');
      return;
    }

    const params = new URLSearchParams({
      exit: trimmedExit,
      state: upperState,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md space-y-4"
      data-testid="search-form"
    >
      <div>
        <label
          htmlFor={exitId}
          className="block text-sm font-medium text-neutral-800"
        >
          Exit
        </label>
        <input
          id={exitId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          required
          placeholder="284"
          value={exit}
          onChange={(e) => setExit(e.target.value)}
          aria-invalid={error !== null && !exit.trim()}
          className="mt-1 block w-full min-h-[48px] rounded-lg border border-neutral-300 px-3 text-base"
          data-testid="search-exit"
        />
      </div>

      <div>
        <label
          htmlFor={stateId}
          className="block text-sm font-medium text-neutral-800"
        >
          State
        </label>
        <input
          id={stateId}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          maxLength={2}
          placeholder="IA"
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value.toUpperCase())}
          aria-invalid={
            error !== null && !US_STATE_REGEX.test(stateCode.toUpperCase())
          }
          className="mt-1 block w-full min-h-[48px] rounded-lg border border-neutral-300 px-3 text-base uppercase"
          data-testid="search-state"
        />
      </div>

      {error !== null && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-700"
          data-testid="search-error"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="min-h-[48px] w-full rounded-lg bg-neutral-900 px-4 text-base font-semibold text-white"
        data-testid="search-submit"
      >
        Find parking
      </button>
    </form>
  );
}
