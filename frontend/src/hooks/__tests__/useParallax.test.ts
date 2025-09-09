import { renderHook, act } from '@testing-library/react';
import { useParallax, useMultiParallax } from '../useParallax';

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: mockCancelAnimationFrame,
});

// Mock window.matchMedia for prefers-reduced-motion
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

// Mock getBoundingClientRect
const mockGetBoundingClientRect = jest.fn();

describe('useParallax', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestAnimationFrame.mockImplementation(callback => {
      callback(performance.now());
      return 1;
    });

    // Mock element with getBoundingClientRect
    mockGetBoundingClientRect.mockReturnValue({
      top: 100,
      height: 200,
    });
  });

  it('should initialize with default transform', () => {
    const { result } = renderHook(() => useParallax());

    expect(result.current.transform).toBe('translate3d(0, 0, 0)');
    expect(result.current.ref.current).toBe(null);
  });

  it('should handle disabled state', () => {
    const { result } = renderHook(() => useParallax({ disabled: true }));

    expect(result.current.transform).toBe('translate3d(0, 0, 0)');
  });

  it('should respect prefers-reduced-motion', () => {
    // Mock prefers-reduced-motion: reduce
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useParallax());

    // Should not add scroll listener when reduced motion is preferred
    expect(result.current.transform).toBe('translate3d(0, 0, 0)');
  });

  it('should calculate transform for different directions', () => {
    const { result: upResult } = renderHook(() => 
      useParallax({ direction: 'up', speed: 1 })
    );
    
    const { result: downResult } = renderHook(() => 
      useParallax({ direction: 'down', speed: 1 })
    );

    const { result: leftResult } = renderHook(() => 
      useParallax({ direction: 'left', speed: 1 })
    );

    const { result: rightResult } = renderHook(() => 
      useParallax({ direction: 'right', speed: 1 })
    );

    // Mock element being in viewport
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    };

    // Set refs to mock elements
    act(() => {
      (upResult.current.ref as any).current = mockElement;
      (downResult.current.ref as any).current = mockElement;
      (leftResult.current.ref as any).current = mockElement;
      (rightResult.current.ref as any).current = mockElement;
    });

    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      window.dispatchEvent(scrollEvent);
    });

    // Verify different directions produce different transforms
    expect(upResult.current.transform).toContain('translate3d(0,');
    expect(downResult.current.transform).toContain('translate3d(0,');
    expect(leftResult.current.transform).toContain('translate3d(');
    expect(rightResult.current.transform).toContain('translate3d(');
  });

  it('should handle scroll events with requestAnimationFrame', () => {
    const { result } = renderHook(() => useParallax());

    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    };

    act(() => {
      (result.current.ref as any).current = mockElement;
    });

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      window.dispatchEvent(scrollEvent);
    });

    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useParallax());

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
});

describe('useMultiParallax', () => {
  it('should create multiple parallax instances', () => {
    const elements = [
      { speed: 0.5, direction: 'up' as const },
      { speed: 1, direction: 'down' as const },
      { speed: 0.3, direction: 'left' as const },
    ];

    const { result } = renderHook(() => useMultiParallax(elements));

    expect(result.current).toHaveLength(3);
    expect(result.current[0].transform).toBe('translate3d(0, 0, 0)');
    expect(result.current[1].transform).toBe('translate3d(0, 0, 0)');
    expect(result.current[2].transform).toBe('translate3d(0, 0, 0)');
  });

  it('should handle empty elements array', () => {
    const { result } = renderHook(() => useMultiParallax([]));

    expect(result.current).toHaveLength(0);
  });
});