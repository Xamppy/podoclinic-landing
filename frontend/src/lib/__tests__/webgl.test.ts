/**
 * Unit tests for WebGL utilities and capability detection
 */

import { 
  detectWebGLSupport, 
  hasMinimumWebGLCapabilities, 
  getPerformanceTier, 
  prefersReducedMotion,
  useReducedMotion 
} from '../webgl';
import { renderHook, act } from '@testing-library/react';

// Mock WebGL context
const mockWebGLContext = {
  getParameter: jest.fn(),
  getExtension: jest.fn(),
  getSupportedExtensions: jest.fn(),
};

const mockWebGL2Context = {
  ...mockWebGLContext,
  // WebGL2 specific methods
  getBufferSubData: jest.fn(),
};

// Mock canvas
const mockCanvas = {
  getContext: jest.fn(),
  remove: jest.fn(),
};

// Mock document.createElement
const originalCreateElement = document.createElement;

describe('WebGL Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.createElement for canvas
    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  describe('detectWebGLSupport', () => {
    it('should detect WebGL2 support when available', () => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl2') return mockWebGL2Context;
        return null;
      });

      mockWebGL2Context.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 4096; // MAX_TEXTURE_SIZE
          case 0x8DFB: return 256;  // MAX_VERTEX_UNIFORM_VECTORS
          case 0x8DFD: return 64;   // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      });

      mockWebGL2Context.getExtension.mockImplementation((name: string) => {
        if (name === 'WEBGL_debug_renderer_info') {
          return {
            UNMASKED_RENDERER_WEBGL: 0x9246,
            UNMASKED_VENDOR_WEBGL: 0x9245,
          };
        }
        return null;
      });

      mockWebGL2Context.getSupportedExtensions.mockReturnValue([
        'EXT_color_buffer_float',
        'OES_texture_float',
      ]);

      const capabilities = detectWebGLSupport();

      expect(capabilities.supported).toBe(true);
      expect(capabilities.version).toBe('webgl2');
      expect(capabilities.maxTextureSize).toBe(4096);
      expect(capabilities.maxVertexUniforms).toBe(256);
      expect(capabilities.maxFragmentUniforms).toBe(64);
      expect(capabilities.extensions).toContain('EXT_color_buffer_float');
    });

    it('should fallback to WebGL1 when WebGL2 is not available', () => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl2') return null;
        if (type === 'webgl' || type === 'experimental-webgl') return mockWebGLContext;
        return null;
      });

      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 2048; // MAX_TEXTURE_SIZE
          case 0x8DFB: return 128;  // MAX_VERTEX_UNIFORM_VECTORS
          case 0x8DFD: return 32;   // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      });

      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue(['OES_texture_float']);

      const capabilities = detectWebGLSupport();

      expect(capabilities.supported).toBe(true);
      expect(capabilities.version).toBe('webgl');
      expect(capabilities.maxTextureSize).toBe(2048);
      expect(capabilities.extensions).toContain('OES_texture_float');
    });

    it('should return unsupported when WebGL is not available', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const capabilities = detectWebGLSupport();

      expect(capabilities.supported).toBe(false);
      expect(capabilities.version).toBe(null);
      expect(capabilities.maxTextureSize).toBe(0);
      expect(capabilities.extensions).toEqual([]);
      expect(capabilities.renderer).toBe('Unknown');
      expect(capabilities.vendor).toBe('Unknown');
    });

    it('should handle WebGL context creation errors gracefully', () => {
      mockCanvas.getContext.mockImplementation(() => {
        throw new Error('WebGL context creation failed');
      });

      const capabilities = detectWebGLSupport();

      expect(capabilities.supported).toBe(false);
      expect(capabilities.version).toBe(null);
    });

    it('should clean up canvas after detection', () => {
      mockCanvas.getContext.mockReturnValue(mockWebGLContext);
      mockWebGLContext.getParameter.mockReturnValue(1024);
      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue([]);

      detectWebGLSupport();

      expect(mockCanvas.remove).toHaveBeenCalled();
    });
  });

  describe('hasMinimumWebGLCapabilities', () => {
    it('should return true for devices with sufficient capabilities', () => {
      mockCanvas.getContext.mockReturnValue(mockWebGLContext);
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 1024; // MAX_TEXTURE_SIZE (above minimum 512)
          case 0x8DFB: return 256;  // MAX_VERTEX_UNIFORM_VECTORS (above minimum 128)
          case 0x8DFD: return 32;   // MAX_FRAGMENT_UNIFORM_VECTORS (above minimum 16)
          default: return 0;
        }
      });
      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue([]);

      const hasCapabilities = hasMinimumWebGLCapabilities();

      expect(hasCapabilities).toBe(true);
    });

    it('should return false for devices with insufficient capabilities', () => {
      mockCanvas.getContext.mockReturnValue(mockWebGLContext);
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 256;  // MAX_TEXTURE_SIZE (below minimum 512)
          case 0x8DFB: return 64;   // MAX_VERTEX_UNIFORM_VECTORS (below minimum 128)
          case 0x8DFD: return 8;    // MAX_FRAGMENT_UNIFORM_VECTORS (below minimum 16)
          default: return 0;
        }
      });
      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue([]);

      const hasCapabilities = hasMinimumWebGLCapabilities();

      expect(hasCapabilities).toBe(false);
    });

    it('should return false when WebGL is not supported', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const hasCapabilities = hasMinimumWebGLCapabilities();

      expect(hasCapabilities).toBe(false);
    });
  });

  describe('getPerformanceTier', () => {
    it('should return high tier for WebGL2 with advanced capabilities', () => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl2') return mockWebGL2Context;
        return null;
      });

      mockWebGL2Context.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 8192; // MAX_TEXTURE_SIZE
          case 0x8DFB: return 512;  // MAX_VERTEX_UNIFORM_VECTORS
          case 0x8DFD: return 128;  // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      });

      mockWebGL2Context.getExtension.mockReturnValue(null);
      mockWebGL2Context.getSupportedExtensions.mockReturnValue([
        'EXT_color_buffer_float',
        'OES_texture_float',
      ]);

      const tier = getPerformanceTier();

      expect(tier).toBe('high');
    });

    it('should return medium tier for WebGL1 with good capabilities', () => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl2') return null;
        if (type === 'webgl' || type === 'experimental-webgl') return mockWebGLContext;
        return null;
      });

      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 2048; // MAX_TEXTURE_SIZE
          case 0x8DFB: return 256;  // MAX_VERTEX_UNIFORM_VECTORS
          case 0x8DFD: return 64;   // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      });

      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue(['OES_texture_float']);

      const tier = getPerformanceTier();

      expect(tier).toBe('medium');
    });

    it('should return low tier for limited WebGL capabilities', () => {
      mockCanvas.getContext.mockReturnValue(mockWebGLContext);
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x0D33: return 1024; // MAX_TEXTURE_SIZE (below 2048)
          case 0x8DFB: return 128;  // MAX_VERTEX_UNIFORM_VECTORS (below 256)
          case 0x8DFD: return 32;   // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      });

      mockWebGLContext.getExtension.mockReturnValue(null);
      mockWebGLContext.getSupportedExtensions.mockReturnValue([]);

      const tier = getPerformanceTier();

      expect(tier).toBe('low');
    });

    it('should return low tier when WebGL is not supported', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const tier = getPerformanceTier();

      expect(tier).toBe('low');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return true when user prefers reduced motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const reducedMotion = prefersReducedMotion();

      expect(reducedMotion).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return false when user does not prefer reduced motion', () => {
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

      const reducedMotion = prefersReducedMotion();

      expect(reducedMotion).toBe(false);
    });

    it('should return false on server side', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const reducedMotion = prefersReducedMotion();

      expect(reducedMotion).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('useReducedMotion hook', () => {
    it('should return initial reduced motion preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(true);
    });

    it('should update when media query changes', () => {
      let mediaQueryCallback: ((event: MediaQueryListEvent) => void) | null = null;

      const mockMediaQuery = {
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event: string, callback: any) => {
          if (event === 'change') {
            mediaQueryCallback = callback;
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockReturnValue(mockMediaQuery),
      });

      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(false);

      // Simulate media query change
      act(() => {
        if (mediaQueryCallback) {
          mediaQueryCallback({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it('should clean up event listeners on unmount', () => {
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockReturnValue(mockMediaQuery),
      });

      const { unmount } = renderHook(() => useReducedMotion());

      unmount();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle legacy browsers with addListener', () => {
      let legacyCallback: ((event: MediaQueryListEvent) => void) | null = null;

      const mockMediaQuery = {
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: jest.fn((callback: any) => {
          legacyCallback = callback;
        }),
        removeListener: jest.fn(),
        // No addEventListener to simulate legacy browser
        dispatchEvent: jest.fn(),
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockReturnValue(mockMediaQuery),
      });

      const { result, unmount } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(false);
      expect(mockMediaQuery.addListener).toHaveBeenCalled();

      // Simulate change in legacy browser
      act(() => {
        if (legacyCallback) {
          legacyCallback({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(result.current).toBe(true);

      // Test cleanup
      unmount();
      expect(mockMediaQuery.removeListener).toHaveBeenCalled();
    });

    it('should handle server-side rendering', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(false);

      global.window = originalWindow;
    });
  });
});