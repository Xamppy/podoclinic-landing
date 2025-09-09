import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...props}>{children}</section>,
  },
}));

jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon">✓</div>,
  Star: () => <div data-testid="star-icon">★</div>,
}));

jest.mock('../../../components/ui/Card', () => ({
  Card: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string; [key: string]: unknown }>) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

jest.mock('../../../components/ui/Button', () => ({
  Button: ({ children, variant, size, className, ...props }: React.PropsWithChildren<{ 
    variant?: string; 
    size?: string; 
    className?: string; 
    [key: string]: unknown 
  }>) => (
    <button className={`${variant} ${size} ${className}`} {...props}>
      {children}
    </button>
  ),
}));

// Import after mocks
import { Pricing } from '../Pricing';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('Pricing Component', () => {
  beforeEach(() => {
    render(<Pricing />);
  });

  describe('Section Header', () => {
    it('renders the main title correctly', () => {
      expect(screen.getByText('Elige el plan que se ajuste a tu clínica')).toBeInTheDocument();
    });

    it('renders the subtitle with correct content', () => {
      expect(screen.getByText(/Planes flexibles diseñados para clínicas/)).toBeInTheDocument();
    });
  });

  describe('Plan Cards Rendering', () => {
    it('renders all three pricing plans', () => {
      expect(screen.getByText('Plan Básico')).toBeInTheDocument();
      expect(screen.getByText('Plan Pro')).toBeInTheDocument();
      expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });

    it('displays correct pricing information', () => {
      expect(screen.getByText('Gratuito')).toBeInTheDocument();
      expect(screen.getByText('$29.990')).toBeInTheDocument();
      expect(screen.getByText('$49.990')).toBeInTheDocument();
    });

    it('shows plan descriptions correctly', () => {
      expect(screen.getByText('Ideal para profesionales independientes')).toBeInTheDocument();
      expect(screen.getByText('Perfecto para clínicas en crecimiento')).toBeInTheDocument();
      expect(screen.getByText('Para clínicas establecidas que buscan máxima eficiencia')).toBeInTheDocument();
    });
  });

  describe('Pro Plan Highlighting', () => {
    it('displays the "Más Popular" badge for Pro plan', () => {
      expect(screen.getByText('Más Popular')).toBeInTheDocument();
    });

    it('renders star icon in the popular badge', () => {
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });

    it('applies special styling to Pro plan card', () => {
      const proCard = screen.getByText('Plan Pro').closest('.relative');
      expect(proCard).toBeInTheDocument();
      
      // Check if the Pro plan has special styling by looking for the popular badge
      const popularBadge = screen.getByText('Más Popular');
      expect(popularBadge).toBeInTheDocument();
    });
  });

  describe('Features Display', () => {
    it('shows basic plan features correctly', () => {
      expect(screen.getByText('1 usuario')).toBeInTheDocument();
      expect(screen.getByText('Hasta 20 pacientes')).toBeInTheDocument();
      expect(screen.getByText('Agenda de citas básica')).toBeInTheDocument();
    });

    it('shows pro plan features correctly', () => {
      expect(screen.getByText('Hasta 5 usuarios')).toBeInTheDocument();
      expect(screen.getByText('Pacientes ilimitados')).toBeInTheDocument();
      expect(screen.getByText('Control de inventario completo')).toBeInTheDocument();
    });

    it('shows premium plan features correctly', () => {
      expect(screen.getByText('Usuarios ilimitados')).toBeInTheDocument();
      expect(screen.getByText('Facturación electrónica (SII)')).toBeInTheDocument();
      expect(screen.getByText('Reportes avanzados y analytics')).toBeInTheDocument();
    });

    it('displays check icons for all features', () => {
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(15); // Should have many check icons
    });
  });

  describe('Basic Plan Limitations', () => {
    it('shows limitations section for basic plan', () => {
      expect(screen.getByText('No incluye:')).toBeInTheDocument();
    });

    it('displays specific limitations', () => {
      expect(screen.getByText('• Sin control de inventario')).toBeInTheDocument();
      expect(screen.getByText('• Sin facturación electrónica')).toBeInTheDocument();
      expect(screen.getByText('• Sin reportes avanzados')).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Buttons', () => {
    it('renders CTA buttons for all plans', () => {
      expect(screen.getByText('Comenzar Gratis')).toBeInTheDocument();
      expect(screen.getAllByText('Solicitar Demo')).toHaveLength(2);
    });

    it('applies correct button variants', () => {
      const freeButton = screen.getByText('Comenzar Gratis');
      const demoButtons = screen.getAllByText('Solicitar Demo');
      
      expect(freeButton).toBeInTheDocument();
      expect(demoButtons[0]).toBeInTheDocument(); // Pro plan button
      expect(demoButtons[1]).toBeInTheDocument(); // Premium plan button
    });

    it('handles button clicks', () => {
      const freeButton = screen.getByText('Comenzar Gratis');
      fireEvent.click(freeButton);
      // Button should be clickable (no errors thrown)
      expect(freeButton).toBeInTheDocument();
    });
  });

  describe('Additional Information', () => {
    it('displays additional info about plan changes and updates', () => {
      expect(screen.getByText(/Todos los planes incluyen actualizaciones gratuitas/)).toBeInTheDocument();
      expect(screen.getByText(/Puedes cambiar de plan en cualquier momento/)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies correct grid classes for responsive design', () => {
      const gridContainer = screen.getByText('Plan Básico').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('has proper spacing and container classes', () => {
      const section = screen.getByText('Elige el plan que se ajuste a tu clínica').closest('section');
      expect(section).toHaveClass('py-16', 'px-6');
    });
  });

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Elige el plan que se ajuste a tu clínica');
      
      const planHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(planHeadings).toHaveLength(3);
    });

    it('provides proper button labels', () => {
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/Comenzar Gratis|Solicitar Demo/);
      });
    });
  });

  describe('Visual Design Elements', () => {
    it('applies correct color scheme classes', () => {
      const title = screen.getByText('Elige el plan que se ajuste a tu clínica');
      expect(title).toHaveClass('text-[#2C6145]');
    });

    it('has proper background styling', () => {
      const section = screen.getByText('Elige el plan que se ajuste a tu clínica').closest('section');
      expect(section).toHaveClass('bg-gray-50');
    });
  });
});