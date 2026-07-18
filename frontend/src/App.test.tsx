import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as any;

describe('App', () => {
  it('renders the StadiumPilot AI title', () => {
    render(<App />);
    expect(screen.getByText('StadiumPilot')).toBeInTheDocument();
  });

  it('renders the chat input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about navigation/i);
    expect(input).toBeInTheDocument();
  });
});
