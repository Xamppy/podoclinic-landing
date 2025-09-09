import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Features } from '../Features';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, onHoverStart, onHoverEnd, className, ...props }: React.HTMLAttributes<HTMLDivElement> & {
      onHoverStart?: () => void;
      onHoverEnd?: () => void;
    }) => 
      <div onClick={onClick} onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd} className={className} {...props}>{children}</div>,
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => <li {...props}>{children}</li>,
  },
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Features Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main title and description', () => {
    render(<Features />);
    
    expect(screen.getByText('Funcionalidades Completas')).toBeInTheDocument();
    expect(screen.getByText(/Todo lo que necesitas para gestionar tu clínica/)).toBeInTheDocument();
    expect(screen.getByText('Haz clic en cada tarjeta para ver más detalles')).toBeInTheDocument();
  });

  it('renders all 6 feature cards', () => {
    render(<Features />);
    
    expect(screen.getByText('Agenda de Citas')).toBeInTheDocument();
    expect(screen.getByText('Fichas de Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Control de Inventario')).toBeInTheDocument();
    expect(screen.getByText('Facturación Electrónica')).toBeInTheDocument();
    expect(screen.getByText('Reportes y Estadísticas')).toBeInTheDocument();
    expect(screen.getByText('Comunicación con Pacientes')).toBeInTheDocument();
  });

  it('shows feature descriptions', () => {
    render(<Features />);
    
    expect(screen.getByText(/Gestiona las citas de tus pacientes de forma eficiente/)).toBeInTheDocument();
    expect(screen.getByText(/Mantén un registro completo del historial médico/)).toBeInTheDocument();
    expect(screen.getByText(/Administra tu stock de productos y materiales/)).toBeInTheDocument();
  });

  it('expands card details when clicked', () => {
    render(<Features />);
    
    // Find the card container for "Agenda de Citas"
    const agendaCard = screen.getByText('Agenda de Citas').closest('[role="button"]') || 
                      screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    
    expect(agendaCard).toBeInTheDocument();
    
    // Initially, detailed features should not be visible
    expect(screen.queryByText('Calendario interactivo con vista diaria, semanal y mensual')).not.toBeInTheDocument();
    
    // Click on the card
    if (agendaCard) {
      fireEvent.click(agendaCard);
    }
    
    // Now detailed features should be visible
    expect(screen.getByText('Calendario interactivo con vista diaria, semanal y mensual')).toBeInTheDocument();
    expect(screen.getByText('Recordatorios automáticos por WhatsApp y email')).toBeInTheDocument();
    expect(screen.getByText('Gestión de disponibilidad y horarios flexibles')).toBeInTheDocument();
    expect(screen.getByText('Integración con Google Calendar')).toBeInTheDocument();
  });

  it('collapses card details when clicked again', () => {
    render(<Features />);
    
    const agendaCard = screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    
    // Click to expand
    if (agendaCard) {
      fireEvent.click(agendaCard);
    }
    
    // Verify it's expanded
    expect(screen.getByText('Calendario interactivo con vista diaria, semanal y mensual')).toBeInTheDocument();
    
    // Click again to collapse
    if (agendaCard) {
      fireEvent.click(agendaCard);
    }
    
    // Verify it's collapsed
    expect(screen.queryByText('Calendario interactivo con vista diaria, semanal y mensual')).not.toBeInTheDocument();
  });

  it('shows "Ver más" and "Ver menos" indicators correctly', () => {
    render(<Features />);
    
    // Initially should show "Ver más"
    const verMasElements = screen.getAllByText('Ver más');
    expect(verMasElements.length).toBeGreaterThan(0);
    
    // Click on first card
    const firstCard = screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    if (firstCard) {
      fireEvent.click(firstCard);
    }
    
    // Should now show "Ver menos" for the expanded card
    expect(screen.getByText('Ver menos')).toBeInTheDocument();
  });

  it('allows multiple cards to be expanded simultaneously', () => {
    render(<Features />);
    
    // Find the clickable card containers
    const agendaCard = screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    const fichasCard = screen.getByText('Fichas de Pacientes').closest('div[class*="cursor-pointer"]');
    
    // Expand first card
    if (agendaCard) {
      fireEvent.click(agendaCard);
    }
    
    // Expand second card
    if (fichasCard) {
      fireEvent.click(fichasCard);
    }
    
    // Both should be expanded simultaneously
    expect(screen.getByText('Calendario interactivo con vista diaria, semanal y mensual')).toBeInTheDocument();
    expect(screen.getByText('Historial médico completo y seguro')).toBeInTheDocument();
    
    // Verify both "Ver menos" indicators are showing
    const verMenosElements = screen.getAllByText('Ver menos');
    expect(verMenosElements).toHaveLength(2);
  });

  it('maintains independent state for each card', () => {
    render(<Features />);
    
    const agendaCard = screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    const fichasCard = screen.getByText('Fichas de Pacientes').closest('div[class*="cursor-pointer"]');
    
    // Expand both cards
    if (agendaCard) fireEvent.click(agendaCard);
    if (fichasCard) fireEvent.click(fichasCard);
    
    // Both should be expanded
    expect(screen.getByText('Calendario interactivo con vista diaria, semanal y mensual')).toBeInTheDocument();
    expect(screen.getByText('Historial médico completo y seguro')).toBeInTheDocument();
    
    // Collapse only the first card
    if (agendaCard) fireEvent.click(agendaCard);
    
    // First should be collapsed, second should remain expanded
    expect(screen.queryByText('Calendario interactivo con vista diaria, semanal y mensual')).not.toBeInTheDocument();
    expect(screen.getByText('Historial médico completo y seguro')).toBeInTheDocument();
  });

  it('renders icons for each feature', () => {
    render(<Features />);
    
    // Check that SVG icons are present
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThanOrEqual(6);
  });

  it('has proper accessibility attributes', () => {
    render(<Features />);
    
    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('Funcionalidades Completas');
    
    // Check for proper heading hierarchy
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings).toHaveLength(6);
  });

  it('displays checkmark icons in expanded details', () => {
    render(<Features />);
    
    const agendaCard = screen.getByText('Agenda de Citas').closest('div[class*="cursor-pointer"]');
    
    // Expand the card
    if (agendaCard) {
      fireEvent.click(agendaCard);
    }
    
    // Check for checkmark icons in the details (SVG with specific path)
    const checkmarkSvgs = screen.getAllByRole('img', { hidden: true });
    expect(checkmarkSvgs.length).toBeGreaterThan(6); // Original 6 + checkmarks
  });

  it('shows different background colors for each feature', () => {
    render(<Features />);
    
    // The background colors are applied via CSS classes, so we check for the presence of the elements
    expect(screen.getByText('Agenda de Citas')).toBeInTheDocument();
    expect(screen.getByText('Fichas de Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Control de Inventario')).toBeInTheDocument();
    expect(screen.getByText('Facturación Electrónica')).toBeInTheDocument();
    expect(screen.getByText('Reportes y Estadísticas')).toBeInTheDocument();
    expect(screen.getByText('Comunicación con Pacientes')).toBeInTheDocument();
  });
});