import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the default value when localStorage has no entry for the key', () => {
    const { result } = renderHook(() =>
      useLocalStorage('favorites', [] as string[]),
    );
    expect(result.current[0]).toEqual([]);
  });

  it('reads the stored value from localStorage on mount', () => {
    window.localStorage.setItem('favorites', JSON.stringify(['stop-A', 'stop-B']));
    const { result } = renderHook(() =>
      useLocalStorage('favorites', [] as string[]),
    );
    expect(result.current[0]).toEqual(['stop-A', 'stop-B']);
  });

  it('persists a new value to localStorage when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('favorites', [] as string[]),
    );

    act(() => {
      result.current[1](['stop-A']);
    });

    expect(result.current[0]).toEqual(['stop-A']);
    expect(window.localStorage.getItem('favorites')).toBe(
      JSON.stringify(['stop-A']),
    );
  });

  it('supports the functional setter form (prev => next)', () => {
    window.localStorage.setItem('favorites', JSON.stringify(['stop-A']));
    const { result } = renderHook(() =>
      useLocalStorage('favorites', [] as string[]),
    );

    act(() => {
      result.current[1]((prev) => [...prev, 'stop-B']);
    });

    expect(result.current[0]).toEqual(['stop-A', 'stop-B']);
    expect(window.localStorage.getItem('favorites')).toBe(
      JSON.stringify(['stop-A', 'stop-B']),
    );
  });

  it('handles QuotaExceededError on setItem gracefully (logs console.error, falls back to in-memory)', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    const { result } = renderHook(() =>
      useLocalStorage('favorites', [] as string[]),
    );

    act(() => {
      result.current[1](['stop-A']);
    });

    // In-memory state still updated even though persistence failed
    expect(result.current[0]).toEqual(['stop-A']);
    expect(consoleError).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleError.mockRestore();
  });

  it('handles SecurityError on setItem (e.g., disabled storage / strict private mode) gracefully', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

    const { result } = renderHook(() =>
      useLocalStorage('hos-state', null as unknown as { startTime: string } | null),
    );

    act(() => {
      result.current[1]({ startTime: '2026-05-03T08:00:00Z' });
    });

    expect(result.current[0]).toEqual({ startTime: '2026-05-03T08:00:00Z' });
    expect(consoleError).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleError.mockRestore();
  });

  it('handles SecurityError on getItem (disabled storage) — returns defaultValue without throwing', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

    const { result } = renderHook(() =>
      useLocalStorage('favorites', ['fallback'] as string[]),
    );

    expect(result.current[0]).toEqual(['fallback']);
    expect(consoleError).toHaveBeenCalled();

    getItemSpy.mockRestore();
    consoleError.mockRestore();
  });

  it('handles non-JSON-parseable stored data gracefully (returns default, logs error)', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    window.localStorage.setItem('favorites', 'not-valid-json{{');

    const { result } = renderHook(() =>
      useLocalStorage('favorites', ['fallback'] as string[]),
    );

    expect(result.current[0]).toEqual(['fallback']);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('SSR-equivalent: initial render returns defaultValue (matches what server would render)', () => {
    // jsdom is the test environment, so localStorage exists. We test the
    // SSR-equivalent behavior by reading state before useEffect has run.
    // Since useEffect runs synchronously inside renderHook on mount, the
    // initial value before mount is captured by inspecting the first render.
    window.localStorage.setItem('favorites', JSON.stringify(['stored']));

    let firstRenderValue: string[] | undefined;
    renderHook(() => {
      const [value] = useLocalStorage('favorites', [] as string[]);
      if (firstRenderValue === undefined) {
        firstRenderValue = value;
      }
      return value;
    });

    // On the very first render (before useEffect commits), the hook
    // returns defaultValue — this is what the server would render.
    expect(firstRenderValue).toEqual([]);
  });
});
