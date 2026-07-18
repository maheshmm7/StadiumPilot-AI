import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as any;

describe('App', () => {
  it('renders the stadium navigation title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/STADIUM NAVIGATION/i)).toBeInTheDocument();
    });
  });

  it('renders the accessibility toggle', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Accessible Route Needed/i)).toBeInTheDocument();
    });
  });
});
