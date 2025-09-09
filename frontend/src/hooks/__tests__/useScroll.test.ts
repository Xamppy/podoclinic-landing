import { renderHook, act } from '@testing-library/react';
import { useScroll } from '../useScroll';

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

describe('useScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollY = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useScroll());

    expect(result.current.scrollY).toBe(0);
    expect(result.current.scrollVelocity).toBe(0);
    expect(result.current.direction).toBe('none');
    expect(result.current.isScrolling).toBe(false);
  });

  it('should update scroll position on scroll event', () => {
    const { result } = renderHook(() => useScroll());

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.scrollY).toBe(100);
    expect(result.current.isScrolling).toBe(true);
  });

  it('should detect scroll direction correctly', () => {
    const { result } = renderHook(() => useScroll());

    // Scroll down
    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.direction).toBe('down');

    // Scroll up
    act(() => {
      window.scrollY = 50;
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.direction).toBe('up');
  });

  it('should calculate scroll velocity', () => {
    const { result } = renderHook(() => useScroll());

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.scrollVelocity).toBeGreaterThan(0);
  });

  it('should set isScrolling to false after scroll stops', () => {
    const { result } = renderHook(() => useScroll());

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.isScrolling).toBe(true);

    // Wait for scroll timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isScrolling).toBe(false);
    expect(result.current.scrollVelocity).toBe(0);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScroll());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should throttle scroll events using requestAnimationFrame', () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
    renderHook(() => useScroll());

    act(() => {
      // Trigger multiple scroll events rapidly
      for (let i = 0; i < 5; i++) {
        window.scrollY = i * 10;
        window.dispatchEvent(new Event('scroll'));
      }
    });

    // Should use requestAnimationFrame for throttling
    expect(rafSpy).toHaveBeenCalled();
  });
});