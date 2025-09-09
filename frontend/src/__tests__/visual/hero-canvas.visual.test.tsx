/**
 * Visual regression tests for HeroCanvas component
 * Tests visual consistency across different scroll positions and states
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { HeroCanvas } from '../../components/3d/HeroCanvas';

// Mock WebGL and performance utilities
jest.mock('../../lib/webgl', () => ({
  useReducedMotion: jest.fn(() => false),
}));

jest.mock('../../lib/performance', () => ({
  useAdaptiveQuality: jest.fn(() => ({
    fps: 60,
    qualityLevel: 'high',
    recommendations: {
      pixelRatio: 2,
      antialias: true,
      shadowMapEnabled: true,
      maxLights: 4,
      particleCount: 100,
      geometryDetail: 1.0,
      animationQuality: 1.0,
    },
    averageFPS: 60,
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('HeroCanvas Visual Regression Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Scroll Position Variations', () => {
    const scrollPositions = [0, 50, 100, 200, 500, 1000];

    scrollPositions.forEach(scrollY => {
      it(`should render consistently at scroll position ${scrollY}`, () => {
        const { container } = render(<HeroCanvas scrollY={scrollY} />);
        
        // Verify container structure
        expect(container.firstChild).toHaveClass('absolute', 'inset-0');
        
        // Check for background layers
        const backgroundLayers = container.querySelectorAll('.bg-gradient-to-br, .bg-gradient-to-tr');
        expect(backgroundLayers.length).toBeGreaterThanOrEqual(2);
        
        // Verify animated elements are present
        const animatedElements = container.querySelectorAll('[style*="transform"]');
        expect(animatedElements.length).toBeGreaterThan(10);
        
        // Check that transforms include scroll-based values
        const transformElements = Array.from(animatedElements) as HTMLElement[];
        const hasScrollBasedTransforms = transformElements.some(element => {
          const transform = element.style.transform;
          return transform.includes('translateY') && transform.includes(`${scrollY * 0.1}px`);
        });
        expect(hasScrollBasedTransforms).toBe(true);
      });
    });

    it('should maintain visual hierarchy across scroll positions', () => {
      const positions = [0, 100, 500];
      const snapshots: HTMLElement[][] = [];
      
      positions.forEach(scrollY => {
        const { container } = render(<HeroCanvas scrollY={scrollY} />);
        const elements = Array.from(container.querySelectorAll('[style*="transform"]')) as HTMLElement[];
        snapshots.push(elements);
        cleanup();
      });
      
      // Verify same number of elements at each position
      const elementCounts = snapshots.map(snapshot => snapshot.length);
      expect(new Set(elementCounts).size).toBe(1); // All counts should be the same
      
      // Verify elements maintain relative positioning
      snapshots.forEach((snapshot, index) => {
        expect(snapshot.length).toBeGreaterThan(10);
        
        // Check that elements have different transform values based on scroll
        const transforms = snapshot.map(el => el.style.transform);
        const uniqueTransforms = new Set(transforms);
        expect(uniqueTransforms.size).toBeGreaterThan(1); // Should have varied transforms
      });
    });
  });

  describe('Animation State Consistency', () => {
    it('should render geometric shapes consistently', () => {
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Should have 12 geometric shapes as per implementation
      const shapes = container.querySelectorAll('[class*="animate-"]');
      const shapeElements = Array.from(shapes).filter(el => 
        el.classList.contains('animate-bounce') ||
        el.classList.contains('animate-pulse') ||
        el.classList.contains('animate-spin')
      );
      
      expect(shapeElements.length).toBe(12);
      
      // Verify shape types and animations
      const bounceShapes = container.querySelectorAll('.animate-bounce');
      const pulseShapes = container.querySelectorAll('.animate-pulse');
      const spinShapes = container.querySelectorAll('.animate-spin');
      
      expect(bounceShapes.length).toBeGreaterThan(0);
      expect(pulseShapes.length).toBeGreaterThan(0);
      expect(spinShapes.length).toBeGreaterThan(0);
    });

    it('should render floating particles consistently', () => {
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Should have 10 floating particles
      const particles = container.querySelectorAll('.animate-ping');
      expect(particles.length).toBe(10);
      
      // Verify particle positioning
      particles.forEach((particle, index) => {
        const element = particle as HTMLElement;
        const style = element.style;
        
        // Should have position styles
        expect(style.left).toBeTruthy();
        expect(style.top).toBeTruthy();
        expect(style.transform).toContain('translateY');
      });
    });

    it('should render main foot shape consistently', () => {
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Main foot shape
      const footShape = container.querySelector('.w-40.h-24');
      expect(footShape).toBeInTheDocument();
      expect(footShape).toHaveClass('bg-gradient-to-br', 'from-[#55A05E]', 'to-[#7BC142]');
      
      // Glow effect
      const glowEffect = container.querySelector('.w-44.h-28');
      expect(glowEffect).toBeInTheDocument();
      expect(glowEffect).toHaveClass('bg-[#55A05E]', 'blur-lg');
    });
  });

  describe('Reduced Motion State', () => {
    it('should render static version consistently', () => {
      const mockWebGL = require('../../lib/webgl');
      mockWebGL.useReducedMotion.mockReturnValue(true);
      
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Should not have animated elements
      const animatedElements = container.querySelectorAll('[class*="animate-"]');
      expect(animatedElements.length).toBe(0);
      
      // Should have static background
      const staticBackground = container.querySelector('.bg-gradient-to-br');
      expect(staticBackground).toBeInTheDocument();
      
      // Should have background pattern
      const backgroundPattern = container.querySelector('[style*="background-image"]');
      expect(backgroundPattern).toBeInTheDocument();
      
      // Should have static foot shape
      const staticFootShape = container.querySelector('.w-32.h-20');
      expect(staticFootShape).toBeInTheDocument();
      expect(staticFootShape).toHaveClass('bg-[#55A05E]', 'opacity-60');
    });

    it('should maintain accessibility in static mode', () => {
      const mockWebGL = require('../../lib/webgl');
      mockWebGL.useReducedMotion.mockReturnValue(true);
      
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Should not have motion-based transforms
      const transformElements = container.querySelectorAll('[style*="transform"]');
      transformElements.forEach(element => {
        const transform = (element as HTMLElement).style.transform;
        // Static transforms are allowed (positioning), but not animation-based ones
        expect(transform).not.toMatch(/rotate\(\d+deg\)/);
      });
    });
  });

  describe('Color Scheme Consistency', () => {
    it('should use consistent color palette', () => {
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Primary colors from design system
      const primaryColors = ['#2C6145', '#55A05E', '#7BC142', '#1A3D2B'];
      
      // Check background gradients use correct colors
      const gradientElements = container.querySelectorAll('[class*="from-"], [class*="to-"], [class*="via-"]');
      
      gradientElements.forEach(element => {
        const classList = Array.from(element.classList);
        const colorClasses = classList.filter(cls => 
          cls.includes('from-[') || cls.includes('to-[') || cls.includes('via-[') || cls.includes('bg-[')
        );
        
        colorClasses.forEach(colorClass => {
          const colorMatch = colorClass.match(/\[#([A-Fa-f0-9]{6})\]/);
          if (colorMatch) {
            const color = `#${colorMatch[1].toUpperCase()}`;
            expect(primaryColors.map(c => c.toUpperCase())).toContain(color);
          }
        });
      });
    });

    it('should maintain opacity consistency', () => {
      const { container } = render(<HeroCanvas scrollY={100} />);
      
      // Check opacity values are within expected ranges
      const opacityElements = container.querySelectorAll('[class*="opacity-"]');
      
      opacityElements.forEach(element => {
        const classList = Array.from(element.classList);
        const opacityClass = classList.find(cls => cls.startsWith('opacity-'));
        
        if (opacityClass) {
          const opacityValue = parseInt(opacityClass.split('-')[1]);
          expect(opacityValue).toBeGreaterThanOrEqual(20);
          expect(opacityValue).toBeLessThanOrEqual(90);
        }
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle different container sizes', () => {
      // Mock different container sizes
      const sizes = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];
      
      sizes.forEach(size => {
        // Mock container dimensions
        Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
          configurable: true,
          value: jest.fn(() => ({
            width: size.width,
            height: size.height,
            top: 0,
            left: 0,
            bottom: size.height,
            right: size.width,
          })),
        });
        
        const { container } = render(<HeroCanvas scrollY={100} />);
        
        // Should render all elements regardless of size
        const animatedElements = container.querySelectorAll('[style*="transform"]');
        expect(animatedElements.length).toBeGreaterThan(10);
        
        // Should maintain proper positioning
        const positionedElements = container.querySelectorAll('[style*="left"], [style*="top"]');
        expect(positionedElements.length).toBeGreaterThan(0);
        
        cleanup();
      });
    });
  });

  describe('Performance Visual Indicators', () => {
    it('should render loading state visually correctly', () => {
      // Mock server-side rendering
      const originalWindow = global.window;
      delete (global as any).window;
      
      const { container } = render(<HeroCanvas />);
      
      // Should show loading spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-2', 'border-[#55A05E]', 'border-t-transparent');
      
      // Should show loading text
      expect(container).toHaveTextContent('Cargando experiencia 3D...');
      
      // Restore window
      global.window = originalWindow;
    });

    it('should maintain visual quality across different quality levels', () => {
      const mockPerformance = require('../../lib/performance');
      
      const qualityLevels = ['low', 'medium', 'high'];
      
      qualityLevels.forEach(qualityLevel => {
        mockPerformance.useAdaptiveQuality.mockReturnValue({
          fps: qualityLevel === 'high' ? 60 : qualityLevel === 'medium' ? 45 : 30,
          qualityLevel,
          recommendations: {
            pixelRatio: qualityLevel === 'high' ? 2 : 1,
            antialias: qualityLevel === 'high',
            shadowMapEnabled: qualityLevel === 'high',
            maxLights: qualityLevel === 'high' ? 4 : 2,
            particleCount: qualityLevel === 'high' ? 100 : 50,
            geometryDetail: qualityLevel === 'high' ? 1.0 : 0.7,
            animationQuality: qualityLevel === 'high' ? 1.0 : 0.7,
          },
          averageFPS: qualityLevel === 'high' ? 60 : 45,
        });
        
        const { container } = render(<HeroCanvas scrollY={100} />);
        
        // Should render core elements regardless of quality
        const backgroundLayers = container.querySelectorAll('.bg-gradient-to-br, .bg-gradient-to-tr');
        expect(backgroundLayers.length).toBeGreaterThanOrEqual(2);
        
        const footShape = container.querySelector('.w-40.h-24');
        expect(footShape).toBeInTheDocument();
        
        cleanup();
      });
    });
  });
});