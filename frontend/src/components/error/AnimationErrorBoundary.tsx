'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface AnimationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AnimationErrorBoundary({ children, fallback }: AnimationErrorBoundaryProps) {
  const defaultFallback = (
    <div className="animate-pulse bg-gray-100 rounded-lg" style={{ minHeight: '100px' }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Contenido no disponible</div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback || defaultFallback}
      onError={(error) => {
        console.warn('Animation component error:', error.message);
        // Could send to analytics service here
      }}
    >
      {children}
    </ErrorBoundary>
  );
}