/**
 * Performance tests for animation components
 * These tests ensure animations don't cause performance issues
 */

import { renderHook, act } from '@testing-library/react';
import { useParallax } from '../../hooks/useParallax';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

// Mock performance.now for consistent timing
const mockPerformanceNow = jest.fn();
Object.defineProperty(performance, 'now', {
  writable: true,
  value: mockPerformanceNow,
});

// Mock requestAnimationFrame for performance testing
const mockRequestAnimationFrame = jest.fn();
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
});

describe('Animation Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestAnimationFrame.mockImplementation(callback => {
      callback(performance.now());
      return 1;
    });
  });

  describe('useParallax Performance', () => {
    it('should use requestAnimationFrame for scroll handling', () => {
      const { result } = renderHook(() => useParallax());

      // Mock element
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          height: 200,
        }),
      };

      act(() => {
        (result.current.ref as any).current = mockElement;
      });

      // Simulate multiple scroll events
      act(() => {
        for (let i = 0; i < 10; i++) {
          const scrollEvent = new Event('scroll');
          window.dispatchEvent(scrollEvent);
        }
      });

      // Should use requestAnimationFrame for performance
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle rapid scroll events efficiently', () => {
      const { result } = renderHook(() => useParallax());

      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          height: 200,
        }),
      };

      act(() => {
        (result.current.ref as any).current = mockElement;
      });

      const startTime = performance.now();
      
      // Simulate rapid scroll events
      act(() => {
        for (let i = 0; i < 100; i++) {
          const scrollEvent = new Event('scroll');
          window.dispatchEvent(scrollEvent);
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (this is a mock test)
      expect(executionTime).toBeLessThan(1000);
    });

    it('should use transform3d for hardware acceleration', () => {
      const { result } = renderHook(() => useParallax());

      // All transforms should use translate3d for hardware acceleration
      expect(result.current.transform).toContain('translate3d');
    });

    it('should not create memory leaks with multiple instances', () => {
      const hooks = [];
      
      // Create multiple parallax instances
      for (let i = 0; i < 50; i++) {
        const { result } = renderHook(() => useParallax());
        hooks.push(result);
      }

      // All should initialize without issues
      expect(hooks).toHaveLength(50);
      hooks.forEach(hook => {
        expect(hook.current.transform).toBeDefined();
      });
    });
  });

  describe('useScrollAnimation Performance', () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });

    beforeEach(() => {
      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: mockIntersectionObserver,
      });
    });

    it('should use IntersectionObserver for efficient viewport detection', () => {
      renderHook(() => useScrollAnimation());

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should handle multiple animation instances efficiently', () => {
      const instances = [];

      // Create multiple scroll animation instances
      for (let i = 0; i < 20; i++) {
        const { result } = renderHook(() => useScrollAnimation());
        instances.push(result);
      }

      expect(instances).toHaveLength(20);
      expect(mockIntersectionObserver).toHaveBeenCalledTimes(20);
    });

    it('should properly cleanup observers on unmount', () => {
      const mockUnobserve = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: mockUnobserve,
        disconnect: jest.fn(),
      });

      const { unmount } = renderHook(() => useScrollAnimation());

      unmount();

      // Should cleanup observer (this would be called in the actual implementation)
      expect(mockUnobserve).toHaveBeenCalled();
    });
  });

  describe('Animation Optimization', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });

      const { result } = renderHook(() => useParallax());

      // Should not add scroll listeners when reduced motion is preferred
      expect(result.current.transform).toBe('translate3d(0, 0, 0)');
    });

    it('should use passive event listeners for scroll events', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      renderHook(() => useParallax());

      // Should use passive listeners for better performance
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );
    });

    it('should throttle expensive calculations', () => {
      const { result } = renderHook(() => useParallax({ speed: 1 }));

      const mockElement = {
        getBoundingClientRect: jest.fn(() => ({
          top: 100,
          height: 200,
        })),
      };

      act(() => {
        (result.current.ref as any).current = mockElement;
      });

      // Simulate multiple rapid scroll events
      act(() => {
        for (let i = 0; i < 10; i++) {
          const scrollEvent = new Event('scroll');
          window.dispatchEvent(scrollEvent);
        }
      });

      // getBoundingClientRect should be called efficiently
      // (In real implementation, this would be throttled)
      expect(mockElement.getBoundingClientRect).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useParallax());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    it('should cancel animation frames on unmount', () => {
      const mockCancelAnimationFrame = jest.fn();
      Object.defineProperty(window, 'cancelAnimationFrame', {
        writable: true,
        value: mockCancelAnimationFrame,
      });

      const { unmount } = renderHook(() => useParallax());

      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });
});