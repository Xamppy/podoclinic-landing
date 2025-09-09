/**
 * Tests for PerformanceManager class
 */

import { PerformanceManager, createPerformanceManager } from '../performanceManager';
import { PERFORMANCE_PRESETS, type DeviceCapabilities } from '../deviceDetection';

// Mock performance.now
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },
  writable: true,
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

describe('PerformanceManager', () => {
  let mockCapabilities: DeviceCapabilities;
  let performanceManager: PerformanceManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16); // Simulate 60fps
      return 1;
    });

    mockCapabilities = {
      gpu: 'medium',
      memory: 8,
      deviceType: 'desktop',
      isMobile: false,
      isLowEnd: false,
      supportedFeatures: {
        webgl: true,
        webgl2: true,
        instancedArrays: true,
        floatTextures: true,
      },
    };

    performanceManager = new PerformanceManager(
      mockCapabilities,
      PERFORMANCE_PRESETS.medium
    );
  });

  afterEach(() => {
    performanceManager.stopMonitoring();
  });

  describe('initialization', () => {
    it('should initialize with correct preset and capabilities', () => {
      expect(performanceManager.getCurrentPreset()).toEqual(PERFORMANCE_PRESETS.medium);
    });

    it('should not be monitoring initially', () => {
      const metrics = performanceManager.getMetrics();
      expect(metrics.averageFPS).toBe(0);
    });
  });

  describe('monitoring', () => {
    it('should start and stop monitoring', () => {
      expect(() => performanceManager.startMonitoring()).not.toThrow();
      expect(() => performanceManager.stopMonitoring()).not.toThrow();
    });

    it('should not start monitoring twice', () => {
      performanceManager.startMonitoring();
      const spy = jest.spyOn(performanceManager as any, 'monitorFrame');
      performanceManager.startMonitoring(); // Second call should be ignored
      
      expect(spy).toHaveBeenCalledTimes(0); // Should not call monitorFrame again
    });

    it('should collect frame metrics', (done) => {
      let frameCount = 0;
      mockPerformanceNow.mockImplementation(() => {
        frameCount++;
        return frameCount * 16.67; // Simulate 60fps timing
      });

      performanceManager.startMonitoring();

      setTimeout(() => {
        const metrics = performanceManager.getMetrics();
        expect(metrics.fps).toBeGreaterThan(0);
        expect(metrics.averageFPS).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('performance callbacks', () => {
    it('should register and call performance callbacks', (done) => {
      const callback = jest.fn();
      const unsubscribe = performanceManager.onPerformanceChange(callback);

      performanceManager.setPreset(PERFORMANCE_PRESETS.high);

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(
          PERFORMANCE_PRESETS.high,
          expect.any(Object)
        );
        unsubscribe();
        done();
      }, 10);
    });

    it('should unsubscribe callbacks correctly', () => {
      const callback = jest.fn();
      const unsubscribe = performanceManager.onPerformanceChange(callback);
      
      unsubscribe();
      performanceManager.setPreset(PERFORMANCE_PRESETS.high);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      performanceManager.onPerformanceChange(errorCallback);
      performanceManager.setPreset(PERFORMANCE_PRESETS.high);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in performance callback:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('preset management', () => {
    it('should set preset manually', () => {
      performanceManager.setPreset(PERFORMANCE_PRESETS.high);
      expect(performanceManager.getCurrentPreset()).toEqual(PERFORMANCE_PRESETS.high);
    });

    it('should downgrade quality when FPS is low', () => {
      // Start with high preset
      performanceManager.setPreset(PERFORMANCE_PRESETS.high);
      
      // Simulate low FPS
      const manager = performanceManager as any;
      manager.frameHistory = Array(60).fill(20); // 20 FPS average
      manager.config.targetFPS = 60;
      
      manager.evaluatePerformance();
      
      expect(performanceManager.getCurrentPreset().name).toBe('medium');
    });

    it('should upgrade quality when FPS is high', () => {
      // Start with low preset
      performanceManager.setPreset(PERFORMANCE_PRESETS.low);
      
      // Simulate high FPS with full sample
      const manager = performanceManager as any;
      manager.frameHistory = Array(60).fill(80); // 80 FPS average
      manager.config.targetFPS = 24;
      
      manager.evaluatePerformance();
      
      expect(performanceManager.getCurrentPreset().name).toBe('medium');
    });

    it('should not downgrade below lowest preset', () => {
      performanceManager.setPreset(PERFORMANCE_PRESETS.low);
      
      // Simulate very low FPS
      const manager = performanceManager as any;
      manager.frameHistory = Array(60).fill(5); // 5 FPS average
      manager.config.targetFPS = 24;
      
      manager.evaluatePerformance();
      
      expect(performanceManager.getCurrentPreset().name).toBe('low');
    });

    it('should not upgrade above highest preset', () => {
      performanceManager.setPreset(PERFORMANCE_PRESETS.high);
      
      // Simulate very high FPS
      const manager = performanceManager as any;
      manager.frameHistory = Array(60).fill(120); // 120 FPS average
      manager.config.targetFPS = 60;
      
      manager.evaluatePerformance();
      
      expect(performanceManager.getCurrentPreset().name).toBe('high');
    });
  });

  describe('metrics', () => {
    it('should return current metrics', () => {
      const metrics = performanceManager.getMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('averageFPS');
      expect(metrics).toHaveProperty('droppedFrames');
      expect(metrics).toHaveProperty('memoryUsage');
    });

    it('should track dropped frames', () => {
      let frameCount = 0;
      mockPerformanceNow.mockImplementation(() => {
        frameCount++;
        // Simulate dropped frames with irregular timing
        return frameCount < 5 ? frameCount * 16.67 : frameCount * 50; // Normal then slow
      });

      performanceManager.startMonitoring();

      setTimeout(() => {
        const metrics = performanceManager.getMetrics();
        expect(metrics.droppedFrames).toBeGreaterThan(0);
      }, 100);
    });

    it('should include memory usage when available', () => {
      const metrics = performanceManager.getMetrics();
      expect(metrics.memoryUsage).toBeDefined();
      expect(typeof metrics.memoryUsage).toBe('number');
    });
  });

  describe('createPerformanceManager', () => {
    it('should create manager with mobile-specific config', () => {
      const mobileCapabilities: DeviceCapabilities = {
        ...mockCapabilities,
        isMobile: true,
        deviceType: 'mobile',
      };

      const manager = createPerformanceManager(mobileCapabilities, PERFORMANCE_PRESETS.medium);
      const config = (manager as any).config;

      expect(config.fpsThreshold).toBe(0.7); // More aggressive on mobile
      expect(config.sampleSize).toBe(30); // Shorter sample window
    });

    it('should create manager with low-end device config', () => {
      const lowEndCapabilities: DeviceCapabilities = {
        ...mockCapabilities,
        isLowEnd: true,
        gpu: 'low',
      };

      const manager = createPerformanceManager(lowEndCapabilities, PERFORMANCE_PRESETS.low);
      const config = (manager as any).config;

      expect(config.fpsThreshold).toBe(0.6); // Very aggressive
      expect(config.degradationSteps).toBe(2); // Degrade faster
    });

    it('should use default config for high-end devices', () => {
      const highEndCapabilities: DeviceCapabilities = {
        ...mockCapabilities,
        gpu: 'high',
        memory: 16,
      };

      const manager = createPerformanceManager(highEndCapabilities, PERFORMANCE_PRESETS.high);
      const config = (manager as any).config;

      expect(config.fpsThreshold).toBe(0.8); // Default threshold
    });
  });
});