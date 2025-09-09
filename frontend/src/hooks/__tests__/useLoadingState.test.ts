import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from '../useLoadingState';

describe('useLoadingState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('initializes with custom loading state', () => {
    const { result } = renderHook(() => useLoadingState(true));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('sets loading state correctly', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('clears error when starting to load', () => {
    const { result } = renderHook(() => useLoadingState());
    const testError = new Error('Test error');

    act(() => {
      result.current.setError(testError);
    });

    expect(result.current.error).toBe(testError);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(true);
  });

  it('sets error state correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    const testError = new Error('Test error');

    act(() => {
      result.current.setError(testError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(testError);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('sets loaded state correctly', () => {
    const { result } = renderHook(() => useLoadingState(true));

    act(() => {
      result.current.setLoaded();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasLoaded).toBe(true);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    const testError = new Error('Test error');

    // Set some state
    act(() => {
      result.current.setError(testError);
      result.current.setLoaded();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useLoadingState());

    const initialFunctions = {
      setLoading: result.current.setLoading,
      setError: result.current.setError,
      setLoaded: result.current.setLoaded,
      reset: result.current.reset
    };

    rerender();

    expect(result.current.setLoading).toBe(initialFunctions.setLoading);
    expect(result.current.setError).toBe(initialFunctions.setError);
    expect(result.current.setLoaded).toBe(initialFunctions.setLoaded);
    expect(result.current.reset).toBe(initialFunctions.reset);
  });
});