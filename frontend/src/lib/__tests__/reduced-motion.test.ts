import { renderHook, act } from '@testing-library/react';
import { useReducedMotion, prefersReducedMotion } from '../webgl';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('prefersReducedMotion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when window is undefined (SSR)', () => {
    const originalWindow = global.window;
    // @ts-expect-error - Intentionally deleting window for SSR test
    delete global.window;

    expect(prefersReducedMotion()).toBe(false);

    global.window = originalWindow;
  });

  it('should return true when user prefers reduced motion', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    expect(prefersReducedMotion()).toBe(true);
  });

  it('should return false when user does not prefer reduced motion', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('useReducedMotion', () => {
  let mockMediaQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should return initial reduced motion preference', () => {
    mockMediaQuery.matches = false;
    
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when user prefers reduced motion', () => {
    mockMediaQuery.matches = true;
    
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should update when media query changes (modern browsers)', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('should update when media query changes (legacy browsers)', () => {
    // Simulate legacy browser without addEventListener
    mockMediaQuery.addEventListener = undefined;
    
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Simulate media query change using legacy addListener
    act(() => {
      const changeHandler = mockMediaQuery.addListener.mock.calls[0][0];
      changeHandler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup event listeners on unmount (modern browsers)', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should cleanup event listeners on unmount (legacy browsers)', () => {
    // Simulate legacy browser
    mockMediaQuery.addEventListener = undefined;
    
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(mockMediaQuery.removeListener).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should handle SSR gracefully', () => {
    const originalWindow = global.window;
    // @ts-expect-error - Intentionally deleting window for SSR test
    delete global.window;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    global.window = originalWindow;
  });

  it('should not crash when matchMedia is not available', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error - Intentionally deleting matchMedia for test
    delete window.matchMedia;

    expect(() => {
      renderHook(() => useReducedMotion());
    }).not.toThrow();

    window.matchMedia = originalMatchMedia;
  });
});