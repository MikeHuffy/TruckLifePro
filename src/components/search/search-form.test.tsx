import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchForm } from './search-form';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

describe('SearchForm', () => {
  it('renders the exit input, state input, and submit button', () => {
    render(<SearchForm />);
    expect(screen.getByTestId('search-exit')).toBeInTheDocument();
    expect(screen.getByTestId('search-state')).toBeInTheDocument();
    expect(screen.getByTestId('search-submit')).toBeInTheDocument();
  });

  it('exit input uses inputMode="numeric" for mobile keyboards', () => {
    render(<SearchForm />);
    const exit = screen.getByTestId('search-exit') as HTMLInputElement;
    expect(exit.inputMode).toBe('numeric');
  });

  it('state input has maxLength of 2 and uppercase autocapitalize', () => {
    render(<SearchForm />);
    const state = screen.getByTestId('search-state') as HTMLInputElement;
    expect(state.maxLength).toBe(2);
    expect(state.getAttribute('autocapitalize')).toBe('characters');
  });

  it('uppercases lowercase state input as the user types', () => {
    render(<SearchForm />);
    const state = screen.getByTestId('search-state') as HTMLInputElement;
    fireEvent.change(state, { target: { value: 'ia' } });
    expect(state.value).toBe('IA');
  });

  it('all primary controls have ≥ 48px tap targets (NFR-A2)', () => {
    render(<SearchForm />);
    expect(screen.getByTestId('search-exit').className).toMatch(/min-h-\[48px\]/);
    expect(screen.getByTestId('search-state').className).toMatch(/min-h-\[48px\]/);
    expect(screen.getByTestId('search-submit').className).toMatch(
      /min-h-\[48px\]/,
    );
  });

  it('navigates to /search?exit=X&state=Y on valid submit', () => {
    render(<SearchForm />);
    fireEvent.change(screen.getByTestId('search-exit'), {
      target: { value: '284' },
    });
    fireEvent.change(screen.getByTestId('search-state'), {
      target: { value: 'IA' },
    });
    fireEvent.click(screen.getByTestId('search-submit'));

    expect(pushMock).toHaveBeenCalledWith('/search?exit=284&state=IA');
  });

  it('trims whitespace from exit input before navigating', () => {
    render(<SearchForm />);
    fireEvent.change(screen.getByTestId('search-exit'), {
      target: { value: '  284  ' },
    });
    fireEvent.change(screen.getByTestId('search-state'), {
      target: { value: 'IA' },
    });
    fireEvent.click(screen.getByTestId('search-submit'));

    expect(pushMock).toHaveBeenCalledWith('/search?exit=284&state=IA');
  });

  it('shows an error in an ARIA live region when exit is empty', () => {
    render(<SearchForm />);
    fireEvent.change(screen.getByTestId('search-state'), {
      target: { value: 'IA' },
    });
    fireEvent.click(screen.getByTestId('search-submit'));

    const error = screen.getByTestId('search-error');
    expect(error).toHaveTextContent(/enter an exit/i);
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.getAttribute('aria-live')).toBe('polite');
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows an error when state is not a valid 2-letter code', () => {
    render(<SearchForm />);
    fireEvent.change(screen.getByTestId('search-exit'), {
      target: { value: '284' },
    });
    fireEvent.change(screen.getByTestId('search-state'), {
      target: { value: 'IOWA' },
    });
    // Note: maxLength=2 in real browsers truncates to 2, but jsdom doesn't
    // enforce that. The validation logic catches it either way.
    fireEvent.click(screen.getByTestId('search-submit'));

    const error = screen.getByTestId('search-error');
    expect(error).toHaveTextContent(/2-letter us state/i);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does not show an error before the user attempts submission', () => {
    render(<SearchForm />);
    expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
  });

  it('clears prior error on successful resubmission', () => {
    render(<SearchForm />);
    // First, fail
    fireEvent.click(screen.getByTestId('search-submit'));
    expect(screen.queryByTestId('search-error')).toBeInTheDocument();

    // Then succeed
    fireEvent.change(screen.getByTestId('search-exit'), {
      target: { value: '284' },
    });
    fireEvent.change(screen.getByTestId('search-state'), {
      target: { value: 'IA' },
    });
    fireEvent.click(screen.getByTestId('search-submit'));

    expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/search?exit=284&state=IA');
  });
});
