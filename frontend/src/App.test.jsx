import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/DevSecOps Currency Converter/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the convert button', () => {
    render(<App />);
    const buttonElement = screen.getByRole('button', { name: /Convert/i });
    expect(buttonElement).toBeInTheDocument();
  });
});