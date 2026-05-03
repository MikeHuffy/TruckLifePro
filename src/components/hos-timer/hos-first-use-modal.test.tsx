import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HosFirstUseModal } from './hos-first-use-modal';

const ACK_KEY = 'tpp.hos-disclaimer-ack.v1';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('HosFirstUseModal', () => {
  it('renders the modal on first use (no ack flag in localStorage)', () => {
    render(<HosFirstUseModal />);
    expect(screen.getByTestId('hos-first-use-modal')).toBeInTheDocument();
  });

  it('renders nothing when the driver has previously acknowledged', () => {
    window.localStorage.setItem(ACK_KEY, JSON.stringify(true));
    const { container } = render(<HosFirstUseModal />);
    // Modal should not be in the DOM at all
    expect(container.querySelector('[data-testid="hos-first-use-modal"]')).toBeNull();
  });

  it('Continue button is disabled until the checkbox is checked', () => {
    render(<HosFirstUseModal />);
    const button = screen.getByTestId('hos-modal-continue');
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByTestId('hos-modal-ack-checkbox'));
    expect(button).not.toBeDisabled();
  });

  it('clicking Continue persists the acknowledgement and unmounts the modal', () => {
    const { rerender } = render(<HosFirstUseModal />);
    fireEvent.click(screen.getByTestId('hos-modal-ack-checkbox'));
    fireEvent.click(screen.getByTestId('hos-modal-continue'));

    // Acknowledgement persisted
    const stored = window.localStorage.getItem(ACK_KEY);
    expect(stored).toBe(JSON.stringify(true));

    // Re-render reflects acknowledged state — modal gone
    rerender(<HosFirstUseModal />);
    expect(screen.queryByTestId('hos-first-use-modal')).not.toBeInTheDocument();
  });

  it('uses dialog role and aria-modal for accessibility (NFR-A4)', () => {
    render(<HosFirstUseModal />);
    const modal = screen.getByTestId('hos-first-use-modal');
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(modal.getAttribute('aria-labelledby')).toBeTruthy();
    expect(modal.getAttribute('aria-describedby')).toBeTruthy();
  });
});

describe('HosDisclaimer (covered indirectly via HosTimer tests)', () => {
  it('placeholder for explicit unit coverage if needed later', () => {
    expect(true).toBe(true);
  });
});
