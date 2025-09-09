/**
 * Comprehensive error handling utilities for Canvas and WebGL operations
 */

export interface CanvasError extends Error {
  type: 'webgl' | 'asset' | 'context' | 'memory' | 'network' | 'unknown';
  recoverable: boolean;
  retryable: boolean;
  context?: Record<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface AssetLoadResult {
  success: boolean;
  error?: CanvasError;
  data?: unknown;
}

/**
 * Create a typed Canvas error with additional context
 */
export function createCanvasError(
  message: string,
  type: CanvasError['type'] = 'unknown',
  options: {
    recoverable?: boolean;
    retryable?: boolean;
    context?: Record<string, any>;
    cause?: Error;
  } = {}
): CanvasError {
  const error = new Error(message) as CanvasError;
  error.type = type;
  error.recoverable = options.recoverable ?? true;
  error.retryable = options.retryable ?? (type !== 'webgl');
  error.context = options.context;
  
  if (options.cause) {
    error.cause = options.cause;
    error.stack = options.cause.stack;
  }
  
  return error;
}

/**
 * Classify error based on message and context
 */
export function classifyError(error: Error): CanvasError {
  const message = error.message.toLowerCase();
  
  if (message.includes('webgl') || message.includes('gl context')) {
    return createCanvasError(error.message, 'webgl', {
      recoverable: false,
      retryable: false,
      context: { originalError: error.message }
    });
  }
  
  if (message.includes('memory') || message.includes('out of memory')) {
    return createCanvasError(error.message, 'memory', {
      recoverable: true,
      retryable: false,
      context: { originalError: error.message }
    });
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('load')) {
    return createCanvasError(error.message, 'network', {
      recoverable: true,
      retryable: true,
      context: { originalError: error.message }
    });
  }
  
  if (message.includes('context') || message.includes('canvas')) {
    return createCanvasError(error.message, 'context', {
      recoverable: true,
      retryable: true,
      context: { originalError: error.message }
    });
  }
  
  return createCanvasError(error.message, 'unknown', {
    recoverable: true,
    retryable: true,
    context: { originalError: error.message }
  });
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2
  }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Check if error is retryable
      const canvasError = classifyError(lastError);
      if (!canvasError.retryable) {
        throw canvasError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      
      console.warn(`Operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw classifyError(lastError!);
}

/**
 * Safe WebGL context creation with error handling
 */
export function createWebGLContext(
  canvas: HTMLCanvasElement,
  options: WebGLContextAttributes = {}
): WebGLRenderingContext | WebGL2RenderingContext | null {
  try {
    // Default options for better compatibility
    const defaultOptions: WebGLContextAttributes = {
      alpha: true,
      antialias: false, // Disable for better performance
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
      ...options
    };
    
    // Try WebGL2 first
    let context: WebGL2RenderingContext | WebGLRenderingContext | null = canvas.getContext('webgl2', defaultOptions) as WebGL2RenderingContext;
    
    if (context) {
      return context;
    }
    
    // Fallback to WebGL1
    context = (canvas.getContext('webgl', defaultOptions) || 
               canvas.getContext('experimental-webgl', defaultOptions)) as WebGLRenderingContext;
    
    if (!context) {
      throw createCanvasError('WebGL not supported', 'webgl', {
        recoverable: false,
        retryable: false,
        context: { options: defaultOptions }
      });
    }
    
    return context;
    
  } catch (error) {
    if (error instanceof Error) {
      throw classifyError(error);
    }
    throw createCanvasError('WebGL context creation failed', 'webgl');
  }
}

/**
 * Asset loading with retry and timeout
 */
export async function loadAssetWithRetry(
  url: string,
  type: 'image' | 'json' | 'text' = 'image',
  timeout: number = 10000
): Promise<AssetLoadResult> {
  try {
    const result = await retryWithBackoff(async () => {
      return new Promise<unknown>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(createCanvasError(`Asset loading timeout: ${url}`, 'network', {
            context: { url, type, timeout }
          }));
        }, timeout);
        
        if (type === 'image') {
          const img = new Image();
          img.onload = () => {
            clearTimeout(timeoutId);
            resolve(img);
          };
          img.onerror = () => {
            clearTimeout(timeoutId);
            reject(createCanvasError(`Failed to load image: ${url}`, 'asset', {
              context: { url, type }
            }));
          };
          img.src = url;
        } else {
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw createCanvasError(`HTTP ${response.status}: ${url}`, 'network', {
                  context: { url, status: response.status, statusText: response.statusText }
                });
              }
              return type === 'json' ? response.json() : response.text();
            })
            .then(data => {
              clearTimeout(timeoutId);
              resolve(data);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(classifyError(error));
            });
        }
      });
    });
    
    return { success: true, data: result };
    
  } catch (error) {
    const canvasError = error instanceof Error ? classifyError(error) : 
      createCanvasError('Unknown asset loading error', 'asset');
    
    return { success: false, error: canvasError };
  }
}

/**
 * Memory usage monitoring for Canvas operations
 */
export class CanvasMemoryMonitor {
  private static instance: CanvasMemoryMonitor;
  private memoryWarningThreshold = 0.8; // 80% of available memory
  private contexts: WeakSet<WebGLRenderingContext | WebGL2RenderingContext> = new WeakSet();
  
  static getInstance(): CanvasMemoryMonitor {
    if (!CanvasMemoryMonitor.instance) {
      CanvasMemoryMonitor.instance = new CanvasMemoryMonitor();
    }
    return CanvasMemoryMonitor.instance;
  }
  
  registerContext(context: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.contexts.add(context);
  }
  
  checkMemoryUsage(): { usage: number; warning: boolean; critical: boolean } {
    if (!('memory' in performance)) {
      return { usage: 0, warning: false, critical: false };
    }
    
    const memory = (performance as any).memory;
    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    return {
      usage,
      warning: usage > this.memoryWarningThreshold,
      critical: usage > 0.95
    };
  }
  
  cleanup(): void {
    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window && typeof (window as Window & { gc?: () => void }).gc === 'function') {
      (window as Window & { gc: () => void }).gc();
    }
  }
}

/**
 * Global error handler for Canvas-related errors
 */
export function setupCanvasErrorHandling(): void {
  // Handle WebGL context lost events
  document.addEventListener('webglcontextlost', (event) => {
    console.warn('WebGL context lost:', event);
    event.preventDefault(); // Prevent default browser behavior
  });
  
  // Handle WebGL context restored events
  document.addEventListener('webglcontextrestored', (event) => {
    console.log('WebGL context restored:', event);
  });
  
  // Monitor memory usage
  const monitor = CanvasMemoryMonitor.getInstance();
  
  setInterval(() => {
    const memoryStatus = monitor.checkMemoryUsage();
    
    if (memoryStatus.critical) {
      console.error('Critical memory usage detected:', memoryStatus);
      monitor.cleanup();
    } else if (memoryStatus.warning) {
      console.warn('High memory usage detected:', memoryStatus);
    }
  }, 30000); // Check every 30 seconds
}