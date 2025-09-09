import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, useStaggeredAnimation } from '../useScrollAnimation';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});

// Mock window.IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useScrollAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.isInView).toBe(false);
    expect(result.current.hasTriggered).toBe(false);
    expect(result.current.ref.current).toBe(null);
  });

  it('should create IntersectionObserver with correct options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '10px',
      triggerOnce: false,
    };

    renderHook(() => useScrollAnimation(options));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '10px',
      }
    );
  });

  it('should handle intersection with delay', () => {
    const { result } = renderHook(() => 
      useScrollAnimation({ delay: 1000, triggerOnce: true })
    );

    // Mock the intersection observer callback
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    // Simulate element entering viewport
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    // Should not be in view immediately due to delay
    expect(result.current.isInView).toBe(false);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isInView).toBe(true);
    expect(result.current.hasTriggered).toBe(true);
  });

  it('should handle triggerOnce option correctly', () => {
    const { result } = renderHook(() => 
      useScrollAnimation({ triggerOnce: true })
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    // First intersection
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(result.current.isInView).toBe(true);
    expect(result.current.hasTriggered).toBe(true);

    // Second intersection (leaving viewport)
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    // Should remain true when triggerOnce is enabled
    expect(result.current.isInView).toBe(true);
  });

  it('should handle repeated intersections when triggerOnce is false', () => {
    const { result } = renderHook(() => 
      useScrollAnimation({ triggerOnce: false })
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    // Enter viewport
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(result.current.isInView).toBe(true);

    // Leave viewport
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(result.current.isInView).toBe(false);
  });
});

describe('useStaggeredAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should initialize with empty visible items', () => {
    const { result } = renderHook(() => useStaggeredAnimation(3, 100));

    expect(result.current.visibleItems.size).toBe(0);
    expect(result.current.isInView).toBe(false);
  });

  it('should stagger item visibility when in view', () => {
    const { result } = renderHook(() => useStaggeredAnimation(3, 100));

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    // Simulate entering viewport
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(result.current.isInView).toBe(true);

    // First item should be visible immediately
    expect(result.current.visibleItems.has(0)).toBe(true);

    // Advance time for second item
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.visibleItems.has(1)).toBe(true);

    // Advance time for third item
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.visibleItems.has(2)).toBe(true);
    expect(result.current.visibleItems.size).toBe(3);
  });

  it('should handle different base delays', () => {
    const { result } = renderHook(() => useStaggeredAnimation(2, 200));

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(result.current.visibleItems.has(0)).toBe(true);

    // Should not have second item yet
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.visibleItems.has(1)).toBe(false);

    // Should have second item after full delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.visibleItems.has(1)).toBe(true);
  });
});