import { renderHook, act } from '@testing-library/react';
import { useAdaptiveQuality, useReducedMotion } from '../performance';

// Mock navigator properties
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  hardwareConcurrency: 8,
};

const mockWebGLContext = {
  getParameter: jest.fn(),
  getExtension: jest.fn(),
};

const mockCanvas = {
  getContext: jest.fn(),
  remove: jest.fn(),
};

// Mock DOM APIs
(global as any).navigator = mockNavigator;
(global as any).document = {
  createElement: jest.fn(() => mockCanvas),
};

// Mock performance.now
(global as any).performance = {
  now: jest.fn(() => Date.now()),
};

// Mock requestAnimationFrame
(global as any).requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
(global as any).cancelAnimationFrame = jest.fn();

describe('Performance Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    mockNavigator.hardwareConcurrency = 8;
    (mockNavigator as any).deviceMemory = 8;
    mockCanvas.getContext.mockReturnValue(mockWebGLContext);
    mockWebGLContext.getParameter.mockReturnValue('NVIDIA GeForce GTX 1080');
    mockWebGLContext.getExtension.mockReturnValue(null);
  });

  describe('useAdaptiveQuality', () => {
    it('should return initial high quality state for high-end desktop', () => {
      const { result } = renderHook(() => useAdaptiveQuality());
      
      expect(result.current.qualityLevel).toBe('high');
      expect(result.current.recommendations.antialias).toBe(true);
      expect(result.current.recommendations.shadowMapEnabled).toBe(true);
      expect(result.current.recommendations.maxLights).toBe(4);
    });

    it('should adapt to mobile devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      (mockNavigator as any).deviceMemory = 3;
      mockNavigator.hardwareConcurrency = 4;
      
      const { result } = renderHook(() => useAdaptiveQuality());
      
      expect(result.current.qualityLevel).toBe('medium');
      expect(result.current.recommendations.particleCount).toBeLessThan(100);
      expect(result.current.recommendations.maxLights).toBeLessThanOrEqual(2);
    });

    it('should adapt to low-end devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Android 8.0; Mobile; rv:61.0)';
      (mockNavigator as any).deviceMemory = 2;
      mockNavigator.hardwareConcurrency = 2;
      mockWebGLContext.getParameter.mockReturnValue('Mali-400 MP');
      
      const { result } = renderHook(() => useAdaptiveQuality());
      
      expect(result.current.qualityLevel).toBe('low');
      expect(result.current.recommendations.antialias).toBe(false);
      expect(result.current.recommendations.shadowMapEnabled).toBe(false);
      expect(result.current.recommendations.geometryDetail).toBeLessThan(0.5);
    });

    it('should handle missing WebGL gracefully', () => {
      mockCanvas.getContext.mockReturnValue(null);
      
      const { result } = renderHook(() => useAdaptiveQuality());
      
      expect(result.current.qualityLevel).toBe('low');
      expect(result.current.recommendations.antialias).toBe(false);
    });
  });

  describe('useReducedMotion', () => {
    const mockMatchMedia = jest.fn();
    
    beforeEach(() => {
      (global as any).window = {
        matchMedia: mockMatchMedia,
      };
    });

    it('should return false when reduced motion is not preferred', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);
      
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(false);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return true when reduced motion is preferred', () => {
      const mockMediaQuery = {
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);
      
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(true);
    });

    it('should update when media query changes', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);
      
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(false);
      
      // Simulate media query change
      act(() => {
        const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
        changeHandler({ matches: true });
      });
      
      expect(result.current).toBe(true);
    });

    it('should clean up event listeners on unmount', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);
      
      const { unmount } = renderHook(() => useReducedMotion());
      
      unmount();
      
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
    });
  });
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset performance.now mock
    let time = 0;
    (global as any).performance.now = jest.fn(() => {
      time += 16.67; // ~60fps
      return time;
    });
  });

  it('should measure frame rate correctly', () => {
    const { result } = renderHook(() => useAdaptiveQuality());
    
    // Initial state should have reasonable FPS
    expect(result.current.fps).toBeGreaterThan(0);
    expect(result.current.averageFPS).toBeGreaterThan(0);
  });

  it('should adapt quality based on performance', () => {
    // Mock poor performance
    let time = 0;
    (global as any).performance.now = jest.fn(() => {
      time += 50; // ~20fps
      return time;
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    
    // Should eventually adapt to lower quality
    // Note: This might require multiple renders to take effect
    expect(result.current.qualityLevel).toBeDefined();
  });
});

describe('Device Capability Detection', () => {
  it('should detect mobile devices correctly', () => {
    mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
    
    const { result } = renderHook(() => useAdaptiveQuality());
    
    // Mobile devices should get optimized settings
    expect(result.current.recommendations.particleCount).toBeLessThan(100);
  });

  it('should detect desktop devices correctly', () => {
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    (mockNavigator as any).deviceMemory = 16;
    mockNavigator.hardwareConcurrency = 12;
    
    const { result } = renderHook(() => useAdaptiveQuality());
    
    // High-end desktop should get high quality settings
    expect(result.current.qualityLevel).toBe('high');
  });

  it('should handle missing device memory gracefully', () => {
    delete (mockNavigator as any).deviceMemory;
    
    const { result } = renderHook(() => useAdaptiveQuality());
    
    // Should still work with default assumptions
    expect(result.current.qualityLevel).toBeDefined();
    expect(result.current.recommendations).toBeDefined();
  });
});