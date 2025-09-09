import {
  createCanvasError,
  classifyError,
  retryWithBackoff,
  createWebGLContext,
  loadAssetWithRetry,
  CanvasMemoryMonitor,
  setupCanvasErrorHandling
} from '../canvasErrorHandling';

// Mock DOM APIs
const mockCanvas = {
  getContext: jest.fn(),
  remove: jest.fn(),
} as unknown as HTMLCanvasElement;

const mockWebGLContext = {
  clearColor: jest.fn(),
  clear: jest.fn(),
  COLOR_BUFFER_BIT: 16384,
} as unknown as WebGLRenderingContext;

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => mockCanvas),
  writable: true,
});

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
  },
  configurable: true,
});

describe('Canvas Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createCanvasError', () => {
    it('should create a typed canvas error with default properties', () => {
      const error = createCanvasError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.type).toBe('unknown');
      expect(error.recoverable).toBe(true);
      expect(error.retryable).toBe(true);
      expect(error.context).toBeUndefined();
    });

    it('should create a WebGL error with correct properties', () => {
      const error = createCanvasError('WebGL failed', 'webgl', {
        recoverable: false,
        retryable: false,
        context: { renderer: 'test' }
      });
      
      expect(error.type).toBe('webgl');
      expect(error.recoverable).toBe(false);
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ renderer: 'test' });
    });

    it('should preserve original error stack when cause is provided', () => {
      const originalError = new Error('Original error');
      const error = createCanvasError('Wrapped error', 'network', {
        cause: originalError
      });
      
      expect(error.cause).toBe(originalError);
      expect(error.stack).toBe(originalError.stack);
    });
  });

  describe('classifyError', () => {
    it('should classify WebGL errors correctly', () => {
      const error = new Error('WebGL context creation failed');
      const classified = classifyError(error);
      
      expect(classified.type).toBe('webgl');
      expect(classified.recoverable).toBe(false);
      expect(classified.retryable).toBe(false);
    });

    it('should classify memory errors correctly', () => {
      const error = new Error('Out of memory');
      const classified = classifyError(error);
      
      expect(classified.type).toBe('memory');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
    });

    it('should classify network errors correctly', () => {
      const error = new Error('Failed to fetch resource');
      const classified = classifyError(error);
      
      expect(classified.type).toBe('network');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should classify context errors correctly', () => {
      const error = new Error('Canvas context lost');
      const classified = classifyError(error);
      
      expect(classified.type).toBe('context');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should classify unknown errors as retryable', () => {
      const error = new Error('Some random error');
      const classified = classifyError(error);
      
      expect(classified.type).toBe('unknown');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(operation, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2
      });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retryWithBackoff(operation, {
        maxRetries: 2,
        baseDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2
      })).rejects.toThrow('Persistent failure');
      
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      const webglError = createCanvasError('WebGL not supported', 'webgl', {
        retryable: false
      });
      const operation = jest.fn().mockRejectedValue(webglError);
      
      await expect(retryWithBackoff(operation)).rejects.toThrow('WebGL not supported');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should implement exponential backoff delays', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      
      await retryWithBackoff(operation, {
        maxRetries: 2,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2
      });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
      expect(totalTime).toBeGreaterThan(250);
    });
  });

  describe('createWebGLContext', () => {
    beforeEach(() => {
      (mockCanvas.getContext as jest.Mock).mockClear();
    });

    it('should create WebGL2 context when available', () => {
      (mockCanvas.getContext as jest.Mock)
        .mockReturnValueOnce(mockWebGLContext) // WebGL2
        .mockReturnValue(null);
      
      const context = createWebGLContext(mockCanvas);
      
      expect(context).toBe(mockWebGLContext);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
    });

    it('should fallback to WebGL1 when WebGL2 is not available', () => {
      (mockCanvas.getContext as jest.Mock)
        .mockReturnValueOnce(null) // WebGL2 fails
        .mockReturnValueOnce(mockWebGLContext) // WebGL1 succeeds
        .mockReturnValue(null);
      
      const context = createWebGLContext(mockCanvas);
      
      expect(context).toBe(mockWebGLContext);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl', expect.any(Object));
    });

    it('should try experimental-webgl as final fallback', () => {
      (mockCanvas.getContext as jest.Mock)
        .mockReturnValueOnce(null) // WebGL2 fails
        .mockReturnValueOnce(null) // WebGL1 fails
        .mockReturnValueOnce(mockWebGLContext); // experimental-webgl succeeds
      
      const context = createWebGLContext(mockCanvas);
      
      expect(context).toBe(mockWebGLContext);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('experimental-webgl', expect.any(Object));
    });

    it('should throw WebGL error when no context is available', () => {
      (mockCanvas.getContext as jest.Mock).mockReturnValue(null);
      
      expect(() => createWebGLContext(mockCanvas)).toThrow('WebGL not supported');
    });

    it('should use custom options', () => {
      (mockCanvas.getContext as jest.Mock).mockReturnValue(mockWebGLContext);
      
      const customOptions = { antialias: true, alpha: false };
      createWebGLContext(mockCanvas, customOptions);
      
      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl2', 
        expect.objectContaining(customOptions)
      );
    });
  });

  describe('loadAssetWithRetry', () => {
    beforeEach(() => {
      // Mock Image constructor
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src: string = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
      } as any;

      // Mock fetch
      global.fetch = jest.fn();
    });

    it('should successfully load an image', async () => {
      const result = await loadAssetWithRetry('test-image.jpg', 'image', 1000);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Image);
    });

    it('should handle image loading errors', async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src: string = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 10);
        }
      } as any;

      const result = await loadAssetWithRetry('invalid-image.jpg', 'image', 1000);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('asset');
    });

    it('should handle fetch timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const result = await loadAssetWithRetry('test.json', 'json', 100);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('network');
      expect(result.error?.message).toContain('timeout');
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await loadAssetWithRetry('missing.json', 'json', 1000);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('network');
      expect(result.error?.message).toContain('404');
    });

    it('should successfully load JSON data', async () => {
      const mockData = { test: 'data' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await loadAssetWithRetry('test.json', 'json', 1000);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('CanvasMemoryMonitor', () => {
    let monitor: CanvasMemoryMonitor;

    beforeEach(() => {
      monitor = CanvasMemoryMonitor.getInstance();
    });

    it('should be a singleton', () => {
      const monitor2 = CanvasMemoryMonitor.getInstance();
      expect(monitor).toBe(monitor2);
    });

    it('should register WebGL contexts', () => {
      expect(() => monitor.registerContext(mockWebGLContext)).not.toThrow();
    });

    it('should check memory usage when performance.memory is available', () => {
      const status = monitor.checkMemoryUsage();
      
      expect(status.usage).toBe(0.5); // 50MB / 100MB
      expect(status.warning).toBe(false);
      expect(status.critical).toBe(false);
    });

    it('should detect memory warnings', () => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 85 * 1024 * 1024, // 85MB
          jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
        },
        configurable: true,
      });

      const status = monitor.checkMemoryUsage();
      
      expect(status.usage).toBe(0.85);
      expect(status.warning).toBe(true);
      expect(status.critical).toBe(false);
    });

    it('should detect critical memory usage', () => {
      // Mock critical memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 96 * 1024 * 1024, // 96MB
          jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
        },
        configurable: true,
      });

      const status = monitor.checkMemoryUsage();
      
      expect(status.usage).toBe(0.96);
      expect(status.warning).toBe(true);
      expect(status.critical).toBe(true);
    });

    it('should handle missing performance.memory gracefully', () => {
      // Remove performance.memory
      const originalMemory = (performance as any).memory;
      delete (performance as any).memory;

      const status = monitor.checkMemoryUsage();
      
      expect(status.usage).toBe(0);
      expect(status.warning).toBe(false);
      expect(status.critical).toBe(false);

      // Restore
      (performance as any).memory = originalMemory;
    });

    it('should call garbage collection when available', () => {
      const mockGc = jest.fn();
      (window as any).gc = mockGc;

      monitor.cleanup();

      expect(mockGc).toHaveBeenCalled();

      delete (window as any).gc;
    });
  });

  describe('setupCanvasErrorHandling', () => {
    beforeEach(() => {
      // Clear any existing event listeners
      document.removeEventListener('webglcontextlost', () => {});
      document.removeEventListener('webglcontextrestored', () => {});
    });

    it('should setup WebGL context event listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      setupCanvasErrorHandling();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('webglcontextlost', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function));
    });

    it('should handle webglcontextlost events', () => {
      setupCanvasErrorHandling();
      
      const event = new Event('webglcontextlost') as any;
      event.preventDefault = jest.fn();
      
      document.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle webglcontextrestored events', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      setupCanvasErrorHandling();
      
      const event = new Event('webglcontextrestored');
      document.dispatchEvent(event);
      
      expect(consoleSpy).toHaveBeenCalledWith('WebGL context restored:', event);
    });
  });
});