import { renderHook } from '@testing-library/react';
import { useLazyLoad } from '../useLazyLoad';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useLazyLoad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLazyLoad());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.hasTriggered).toBe(false);
    expect(result.current.ref.current).toBe(null);
  });

  it('sets up IntersectionObserver with default options', () => {
    renderHook(() => useLazyLoad());

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );
  });

  it('sets up IntersectionObserver with custom options', () => {
    renderHook(() => useLazyLoad({
      rootMargin: '200px',
      threshold: 0.5,
      triggerOnce: false
    }));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '200px',
        threshold: 0.5
      }
    );
  });

  it('observes element when ref is set', () => {
    const mockObserve = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: jest.fn()
    });

    const { result } = renderHook(() => useLazyLoad());
    
    // Simulate setting a ref
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });

    // Re-render to trigger useEffect
    renderHook(() => useLazyLoad());

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('disconnects observer on unmount', () => {
    const mockDisconnect = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: mockDisconnect
    });

    const { unmount } = renderHook(() => useLazyLoad());
    
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  // Test intersection behavior
  it('handles intersection correctly with triggerOnce=true', () => {
    let intersectionCallback: (entries: any[]) => void;
    const mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect
      };
    });

    const { result } = renderHook(() => useLazyLoad({ triggerOnce: true }));

    // Simulate intersection
    intersectionCallback([{ isIntersecting: true }]);

    // Note: In a real test, we'd need to handle the async state update
    // This is a simplified test structure
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles intersection correctly with triggerOnce=false', () => {
    let intersectionCallback: (entries: any[]) => void;
    const mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect
      };
    });

    renderHook(() => useLazyLoad({ triggerOnce: false }));

    // Simulate intersection
    intersectionCallback([{ isIntersecting: true }]);

    // Should not disconnect when triggerOnce is false
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});