import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';

// Simple test to verify the Contact component can be imported and basic functionality works
describe('Contact Component', () => {
  // Mock all dependencies to isolate the test
  beforeAll(() => {
    // Mock framer-motion
    jest.doMock('framer-motion', () => ({
      motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...props}>{children}</section>,
      },
    }));
  });

  it('Contact component can be imported without errors', async () => {
    // Dynamic import to ensure mocks are applied
    const { Contact } = await import('../Contact');
    
    const { container } = render(<Contact />);
    
    // Basic test - just verify the component renders without crashing
    expect(container).toBeInTheDocument();
  });

  it('renders basic form elements', async () => {
    const { Contact } = await import('../Contact');
    
    render(<Contact />);
    
    // Test that basic text content is rendered
    expect(screen.getByText(/solicita una demostración/i)).toBeInTheDocument();
    expect(screen.getByText(/contacto@podoclinic.cl/i)).toBeInTheDocument();
  });
});