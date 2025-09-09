import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16); // Simulate 60fps
  return 1;
});

const mockCancelAnimationFrame = jest.fn();

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

describe('useCountUp Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with start value', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100 })
    );

    expect(result.current.value).toBe('0');
  });

  it('formats number with suffix correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 5, suffix: 'h' })
    );

    expect(result.current.value).toBe('0h');
  });

  it('formats number with prefix correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100, prefix: '$' })
    );

    expect(result.current.value).toBe('$0');
  });

  it('formats number with decimals correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 95.5, decimals: 1, suffix: '%' })
    );

    expect(result.current.value).toBe('0.0%');
  });

  it('formats number with separator for large numbers', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 1000, separator: ',' })
    );

    expect(result.current.value).toBe('0');
  });

  it('provides start and reset methods', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100, duration: 1000 })
    );

    expect(typeof result.current.start).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('resets to start value when reset method is called', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100 })
    );

    // Reset should return to start value
    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('0');
  });

  it('handles delay parameter correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100, delay: 500 })
    );

    // Should still initialize with start value
    expect(result.current.value).toBe('0');
  });

  it('provides consistent API interface', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100 })
    );

    // Should have all required methods and properties
    expect(result.current).toHaveProperty('value');
    expect(result.current).toHaveProperty('start');
    expect(result.current).toHaveProperty('reset');
  });

  it('handles animation state correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100 })
    );

    // Should be able to call start multiple times without error
    act(() => {
      result.current.start();
      result.current.start(); // Should not throw
    });

    expect(result.current.value).toBeDefined();
  });

  it('applies easing function correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100, duration: 100 })
    );

    act(() => {
      result.current.start();
    });

    // The exact value depends on the easing function implementation
    // We just verify that the animation progresses
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Value should be between start and end
    const currentValue = parseFloat(result.current.value);
    expect(currentValue).toBeGreaterThan(0);
    expect(currentValue).toBeLessThan(100);
  });

  it('reaches end value when animation completes', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 100, duration: 100 })
    );

    act(() => {
      result.current.start();
    });

    // Fast forward past animation duration
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.value).toBe('100');
  });

  it('handles percentage values correctly', () => {
    const { result } = renderHook(() => 
      useCountUp({ start: 0, end: 95, suffix: '%' })
    );

    expect(result.current.value).toBe('0%');

    act(() => {
      result.current.start();
    });

    // After animation should show end value
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.value).toBe('95%');
  });
});