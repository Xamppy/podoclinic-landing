'use client';

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  hasLoaded: boolean;
}

export function useLoadingState(initialLoading = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    hasLoaded: false
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error // Clear error when starting to load
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      hasLoaded: error === null ? prev.hasLoaded : false
    }));
  }, []);

  const setLoaded = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      hasLoaded: true
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      hasLoaded: false
    });
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setLoaded,
    reset
  };
}