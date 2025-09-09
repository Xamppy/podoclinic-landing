import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: React.ComponentProps<'nav'>) => <nav {...props}>{children}</nav>,
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Rendering', () => {
    it('renders the footer element with correct role and aria-label', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('aria-label', 'Información de la empresa y enlaces legales');
    });

    it('displays the company logo and name', () => {
      const companyName = screen.getByText('Podoclinic');
      expect(companyName).toBeInTheDocument();
      expect(companyName).toHaveClass('text-xl', 'font-bold', 'text-[#2C6145]');
    });

    it('renders the logo placeholder with correct styling', () => {
      const logoPlaceholder = screen.getByText('P');
      expect(logoPlaceholder).toBeInTheDocument();
      expect(logoPlaceholder.parentElement).toHaveClass(
        'w-8', 'h-8', 'bg-gradient-to-br', 'from-[#2C6145]', 'to-[#55A05E]', 'rounded-lg'
      );
    });
  });

  describe('Company Information', () => {
    it('displays company email with correct link', () => {
      const emailLink = screen.getByRole('link', { name: /enviar email a contacto@podoclinic\.cl/i });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:contacto@podoclinic.cl');
      expect(emailLink).toHaveClass('hover:text-[#55A05E]');
    });

    it('displays company phone with correct link', () => {
      const phoneLink = screen.getByRole('link', { name: /llamar al \+56 9 1234 5678/i });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+56 9 1234 5678');
      expect(phoneLink).toHaveClass('hover:text-[#55A05E]');
    });
  });

  describe('Legal Links', () => {
    it('renders navigation with correct aria-label', () => {
      const navigation = screen.getByRole('navigation', { name: 'Enlaces legales' });
      expect(navigation).toBeInTheDocument();
    });

    it('displays all legal links with correct hrefs', () => {
      const privacyLink = screen.getByRole('link', { name: 'Política de Privacidad' });
      const termsLink = screen.getByRole('link', { name: 'Términos de Servicio' });
      const cookiesLink = screen.getByRole('link', { name: 'Política de Cookies' });

      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');

      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');

      expect(cookiesLink).toBeInTheDocument();
      expect(cookiesLink).toHaveAttribute('href', '/cookies');
    });

    it('applies correct styling to legal links', () => {
      const privacyLink = screen.getByRole('link', { name: 'Política de Privacidad' });
      expect(privacyLink).toHaveClass(
        'text-sm', 'text-gray-600', 'hover:text-[#55A05E]', 'transition-colors'
      );
    });

    it('has proper focus styles for accessibility', () => {
      const privacyLink = screen.getByRole('link', { name: 'Política de Privacidad' });
      expect(privacyLink).toHaveClass(
        'focus:outline-none', 'focus:ring-2', 'focus:ring-[#55A05E]', 'focus:ring-offset-2'
      );
    });
  });

  describe('Copyright Information', () => {
    it('displays current year in copyright', () => {
      const currentYear = new Date().getFullYear();
      const copyright = screen.getByText(new RegExp(`© ${currentYear} Podoclinic`));
      expect(copyright).toBeInTheDocument();
    });

    it('displays "Todos los derechos reservados" text', () => {
      const rightsText = screen.getByText(/todos los derechos reservados/i);
      expect(rightsText).toBeInTheDocument();
    });

    it('displays "Hecho con ❤️ en Chile" text', () => {
      const madeInChile = screen.getByText(/hecho con ❤️ en chile/i);
      expect(madeInChile).toBeInTheDocument();
    });
  });

  describe('Company Description', () => {
    it('displays the company description', () => {
      const description = screen.getByText('Sistema integral de gestión para clínicas de podología y manicura');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-xs', 'text-gray-400', 'text-center');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile and desktop layouts', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('py-8', 'md:py-12');
    });

    it('has responsive flex direction classes', () => {
      const mainContainer = screen.getByRole('contentinfo').querySelector('.flex');
      expect(mainContainer).toHaveClass('flex-col', 'md:flex-row');
    });

    it('applies responsive spacing classes', () => {
      const mainContainer = screen.getByRole('contentinfo').querySelector('.flex');
      expect(mainContainer).toHaveClass('space-y-6', 'md:space-y-0');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure with footer role', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      const companyHeading = screen.getByRole('heading', { level: 2 });
      expect(companyHeading).toHaveTextContent('Podoclinic');
    });

    it('has aria-hidden attribute on decorative logo', () => {
      const logoContainer = screen.getByText('P').parentElement;
      expect(logoContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('has descriptive aria-labels for contact links', () => {
      const emailLink = screen.getByLabelText(/enviar email a/i);
      const phoneLink = screen.getByLabelText(/llamar al/i);
      
      expect(emailLink).toBeInTheDocument();
      expect(phoneLink).toBeInTheDocument();
    });
  });

  describe('Styling and Design System', () => {
    it('uses correct color scheme from design system', () => {
      const companyName = screen.getByText('Podoclinic');
      expect(companyName).toHaveClass('text-[#2C6145]');
    });

    it('applies proper border and background styling', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white', 'border-t', 'border-gray-100');
    });

    it('has correct container max-width and padding', () => {
      const container = screen.getByRole('contentinfo').querySelector('.max-w-7xl');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-6', 'lg:px-8');
    });
  });
});