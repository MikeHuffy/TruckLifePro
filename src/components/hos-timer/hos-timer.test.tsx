import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { HosTimer } from './hos-timer';

const STORAGE_KEY = 'tpp.hos-state.v1';

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-03T08:00:00Z'));
});

afterEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
});

function seedHosState(state: object) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe('HosTimer', () => {
  it('renders the placeholder when no timer is set', () => {
    render(<HosTimer />);
    expect(screen.getByTestId('hos-placeholder')).toHaveTextContent(
      /set your timer/i,
    );
    // Disclaimer is present even in placeholder state (FR9).
    expect(screen.getByTestId('hos-disclaimer')).toBeInTheDocument();
  });

  it('renders the live countdown when timer state exists', () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });

    render(<HosTimer />);
    act(() => {
      // Trigger useEffect → setNow loop
      vi.advanceTimersByTime(0);
    });

    const countdown = screen.getByTestId('hos-countdown');
    // 11h drive limit at start of shift = 11:00:00
    expect(countdown).toHaveTextContent('11:00:00');
  });

  it('countdown decrements every second', async () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });

    render(<HosTimer />);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const countdown = screen.getByTestId('hos-countdown');
    expect(countdown).toHaveTextContent('11:00:00');

    act(() => {
      vi.advanceTimersByTime(2000); // +2 seconds
    });

    expect(countdown).toHaveTextContent('10:59:58');
  });

  it('shows "drive limit" label when duty status is driving', () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });
    render(<HosTimer />);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText(/drive limit/i)).toBeInTheDocument();
  });

  it('shows "shift limit" label when duty status is on-duty-not-driving', () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'on-duty-not-driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });
    render(<HosTimer />);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText(/shift limit/i)).toBeInTheDocument();
  });

  it('shows "Off-duty required" when the limit is exceeded', () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });
    // Advance time to 12 hours past shift start (1 hour past the 11h drive limit).
    vi.setSystemTime(new Date('2026-05-03T20:00:00Z'));

    render(<HosTimer />);
    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByTestId('hos-exceeded')).toHaveTextContent(/off-duty required/i);
    expect(screen.getByTestId('hos-countdown')).toHaveTextContent('0:00:00');
  });

  it('always renders the disclaimer alongside the countdown (FR9)', () => {
    seedHosState({
      shiftStartIso: '2026-05-03T08:00:00.000Z',
      dutyStatus: 'driving',
      setAtIso: '2026-05-03T08:00:00.000Z',
    });
    render(<HosTimer />);
    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByTestId('hos-disclaimer')).toBeInTheDocument();
    expect(screen.getByTestId('hos-disclaimer').textContent).toMatch(
      /informational only.*not an eld/i,
    );
  });
});
