'use client';

import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { detectWebGLSupport, hasMinimumWebGLCapabilities } from '@/lib/webgl';

interface ThreeDErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface CanvasFallbackProps {
  error?: Error;
  onRetry?: () => void;
  enableRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Enhanced fallback UI for Canvas errors with retry functionality
 */
function CanvasFallback({ 
  error, 
  onRetry, 
  enableRetry = true, 
  retryCount = 0, 
  maxRetries = 3 
}: CanvasFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Detect WebGL capabilities for better error messaging
  const webglCapabilities = detectWebGLSupport();
  const hasWebGL = hasMinimumWebGLCapabilities();

  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying || retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    
    // Add a small delay to prevent rapid retries
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, retryCount, maxRetries]);

  // Determine error type and appropriate message
  const getErrorInfo = () => {
    if (!webglCapabilities.supported) {
      return {
        title: 'WebGL no compatible',
        message: 'Tu navegador no soporta WebGL. El contenido se mostrará en modo simplificado.',
        canRetry: false,
        severity: 'warning' as const
      };
    }

    if (!hasWebGL) {
      return {
        title: 'Capacidades limitadas',
        message: 'Tu dispositivo tiene capacidades gráficas limitadas. Usando modo optimizado.',
        canRetry: false,
        severity: 'info' as const
      };
    }

    if (error?.message?.includes('WebGL')) {
      return {
        title: 'Error de WebGL',
        message: 'Hubo un problema con el renderizado 3D. Intentando modo alternativo.',
        canRetry: true,
        severity: 'error' as const
      };
    }

    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        title: 'Error de conexión',
        message: 'No se pudieron cargar los recursos 3D. Verifica tu conexión.',
        canRetry: true,
        severity: 'error' as const
      };
    }

    return {
      title: 'Contenido 3D no disponible',
      message: 'El contenido interactivo no se pudo cargar, pero puedes continuar navegando.',
      canRetry: enableRetry && retryCount < maxRetries,
      severity: 'warning' as const
    };
  };

  const errorInfo = getErrorInfo();
  const showRetry = errorInfo.canRetry && enableRetry && retryCount < maxRetries;

  // Enhanced static background that maintains visual appeal
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#2C6145] via-[#55A05E] to-[#2C6145] opacity-90">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-repeat animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Static foot shape to maintain visual consistency */}
      <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 opacity-60">
        <div className="w-32 h-20 bg-[#55A05E] rounded-full shadow-xl animate-pulse" />
        <div className="absolute inset-0 w-36 h-24 bg-[#55A05E] rounded-full opacity-20 -translate-x-2 -translate-y-2 blur-lg" />
      </div>

      {/* Floating geometric shapes for visual interest */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`fallback-shape-${i}`}
            className="absolute opacity-30 bg-white rounded-full animate-bounce"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              left: `${20 + i * 8}%`,
              top: `${30 + (i * 5) % 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Error notification - positioned to not interfere with main content */}
      <div className="absolute top-4 right-4 max-w-sm z-50">
        <div className={`
          rounded-lg p-4 shadow-lg backdrop-blur-sm border
          ${errorInfo.severity === 'error' 
            ? 'bg-red-50/90 border-red-200 text-red-800' 
            : errorInfo.severity === 'warning'
            ? 'bg-yellow-50/90 border-yellow-200 text-yellow-800'
            : 'bg-blue-50/90 border-blue-200 text-blue-800'
          }
        `}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {errorInfo.severity === 'error' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : errorInfo.severity === 'warning' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">{errorInfo.title}</h3>
              <p className="text-xs mt-1 opacity-90">{errorInfo.message}</p>
              
              {showRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="mt-2 text-xs px-3 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetrying ? 'Reintentando...' : `Reintentar (${maxRetries - retryCount} restantes)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThreeDErrorBoundary({ 
  children, 
  fallback, 
  onRetry,
  enableRetry = true,
  maxRetries = 3
}: ThreeDErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [errorKey, setErrorKey] = useState(0);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) return;
    
    setRetryCount(prev => prev + 1);
    setErrorKey(prev => prev + 1);
    
    if (onRetry) {
      onRetry();
    }
  }, [retryCount, maxRetries, onRetry]);

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Enhanced error logging with context
    console.error('3D Canvas Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount,
      webglSupported: detectWebGLSupport().supported,
      timestamp: new Date().toISOString(),
    });

    // Could send to analytics/monitoring service
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as unknown as Window & { gtag?: (...args: unknown[]) => void };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'exception', {
          description: `3D Canvas Error: ${error.message}`,
          fatal: false,
          custom_map: {
            retry_count: retryCount,
            webgl_supported: detectWebGLSupport().supported,
          }
        });
      }
    }
  }, [retryCount]);

  const defaultFallback = (
    <CanvasFallback
      onRetry={handleRetry}
      enableRetry={enableRetry}
      retryCount={retryCount}
      maxRetries={maxRetries}
    />
  );

  return (
    <ErrorBoundary
      key={errorKey} // Force remount on retry
      fallback={fallback || defaultFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}