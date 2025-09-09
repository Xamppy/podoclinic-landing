import React from 'react';
import { render, screen } from '@testing-library/react';
import { Hero } from '../Hero';

// Mock the HeroCanvas component to avoid Three.js issues in tests
jest.mock('@/components/3d/HeroCanvas', () => ({
  HeroCanvas: ({ className }: { className?: string }) => (
    <div className={`mock-hero-canvas ${className || ''}`} data-testid="hero-canvas">
      Mock 3D Canvas
    </div>
  ),
}));

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => {
  return (importFunc: () => Promise<any>) => {
    const MockComponent = ({ className }: { className?: string }) => (
      <div className={`mock-hero-canvas ${className || ''}`} data-testid="hero-canvas">
        Mock 3D Canvas
      </div>
    );
    return MockComponent;
  };
});

describe('Hero Component Integration', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('should render with HeroCanvas integration', () => {
    render(<Hero />);
    
    // Check that the main content is present
    expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
    expect(screen.getByText(/Gestiona tu clínica sin esfuerzo/)).toBeInTheDocument();
    
    // Check that the HeroCanvas is rendered
    expect(screen.getByTestId('hero-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('hero-canvas')).toHaveClass('z-0');
  });

  it('should maintain proper z-index layering', () => {
    const { container } = render(<Hero />);
    
    // Check that HeroCanvas has z-0 class
    const canvas = screen.getByTestId('hero-canvas');
    expect(canvas).toHaveClass('z-0');
    
    // Check that content overlay has higher z-index
    const contentOverlay = container.querySelector('.z-10');
    expect(contentOverlay).toBeInTheDocument();
  });

  it('should preserve all existing Framer Motion animations', () => {
    render(<Hero />);
    
    // Check that all animated elements are present
    expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
    expect(screen.getByText(/La solución integral/)).toBeInTheDocument();
    expect(screen.getByText('Solicita una Demostración Gratis')).toBeInTheDocument();
    expect(screen.getByText('Ver Funcionalidades')).toBeInTheDocument();
    
    // Check benefit previews
    expect(screen.getByText('Ahorra Tiempo')).toBeInTheDocument();
    expect(screen.getByText('Evita Pérdidas')).toBeInTheDocument();
    expect(screen.getByText('Mejora tu Servicio')).toBeInTheDocument();
  });

  it('should maintain responsive grid layout', () => {
    const { container } = render(<Hero />);
    
    // Check grid layout classes
    const grid = container.querySelector('.grid-cols-1.lg\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
    
    // Check responsive text alignment
    const textContent = container.querySelector('.text-center.lg\\:text-left');
    expect(textContent).toBeInTheDocument();
  });

  it('should preserve CTA button functionality', () => {
    // Mock getElementById
    const mockElement = { scrollIntoView: jest.fn() };
    document.getElementById = jest.fn().mockReturnValue(mockElement);
    
    render(<Hero />);
    
    const ctaButton = screen.getByText('Solicita una Demostración Gratis');
    expect(ctaButton).toBeInTheDocument();
    
    ctaButton.click();
    expect(document.getElementById).toHaveBeenCalledWith('contact');
  });

  it('should maintain scroll indicator positioning', () => {
    const { container } = render(<Hero />);
    
    // Check scroll indicator has proper z-index
    const scrollIndicator = container.querySelector('.z-20');
    expect(scrollIndicator).toBeInTheDocument();
    
    // Check scroll indicator content
    expect(screen.getByText('Descubre más')).toBeInTheDocument();
  });
});