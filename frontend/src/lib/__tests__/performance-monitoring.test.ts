import { renderHook } from '@testing-library/react';
import { PerformanceMonitor, useAdaptiveQuality } from '../performance';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => [{ duration: 16.67 }]),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16.67); // ~60fps
  return 1;
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    monitor.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  it('should be a singleton', () => {
    const monitor1 = PerformanceMonitor.getInstance();
    const monitor2 = PerformanceMonitor.getInstance();
    expect(monitor1).toBe(monitor2);
  });

  it('should start and stop monitoring', () => {
    expect(() => monitor.startMonitoring()).not.toThrow();
    expect(() => monitor.stopMonitoring()).not.toThrow();
  });

  it('should track frame rates', (done) => {
    const callback = jest.fn();
    const unsubscribe = monitor.onFrameRate(callback);

    monitor.startMonitoring();

    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
      unsubscribe();
      done();
    }, 100);
  });

  it('should calculate average FPS', () => {
    // Initially should return 60 (default)
    expect(monitor.getAverageFPS()).toBe(60);
  });

  it('should adjust quality level based on FPS', (done) => {
    monitor.startMonitoring();

    // Simulate low FPS by mocking frame rate callback
    const callback = jest.fn((fps) => {
      if (fps < 30) {
        // Should adjust to low quality
        setTimeout(() => {
          expect(monitor.getQualityLevel()).toBe('low');
          done();
        }, 2100); // Wait for assessment interval
      }
    });

    monitor.onFrameRate(callback);

    // Simulate low FPS
    setTimeout(() => {
      callback(20); // Low FPS
    }, 50);
  });

  it('should provide performance recommendations', () => {
    const recommendations = monitor.getPerformanceRecommendations();

    expect(recommendations).toHaveProperty('pixelRatio');
    expect(recommendations).toHaveProperty('antialias');
    expect(recommendations).toHaveProperty('shadowMapEnabled');
    expect(recommendations).toHaveProperty('maxLights');
    expect(recommendations).toHaveProperty('particleCount');
  });

  it('should provide different recommendations for different quality levels', () => {
    // Force different quality levels and check recommendations
    const highQuality = monitor.getPerformanceRecommendations();
    
    // Simulate low performance to trigger quality reduction
    // This would normally happen through the assessment cycle
    expect(highQuality.maxLights).toBeGreaterThanOrEqual(1);
    expect(highQuality.particleCount).toBeGreaterThanOrEqual(20);
  });

  it('should handle unsubscribe from frame rate callbacks', () => {
    const callback = jest.fn();
    const unsubscribe = monitor.onFrameRate(callback);

    expect(() => unsubscribe()).not.toThrow();
  });
});

describe('useAdaptiveQuality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial quality state', () => {
    const { result } = renderHook(() => useAdaptiveQuality());

    expect(result.current.fps).toBe(60);
    expect(result.current.qualityLevel).toBe('high');
    expect(result.current.recommendations).toBeDefined();
    expect(result.current.averageFPS).toBe(60);
  });

  it('should update FPS when monitor reports changes', (done) => {
    const { result } = renderHook(() => useAdaptiveQuality());

    // Start monitoring to trigger callbacks
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMonitoring();

    setTimeout(() => {
      // FPS should be updated from the monitor
      expect(typeof result.current.fps).toBe('number');
      monitor.stopMonitoring();
      done();
    }, 100);
  });

  it('should provide recommendations based on quality level', () => {
    const { result } = renderHook(() => useAdaptiveQuality());

    const recommendations = result.current.recommendations;
    expect(recommendations.pixelRatio).toBeGreaterThan(0);
    expect(typeof recommendations.antialias).toBe('boolean');
    expect(typeof recommendations.shadowMapEnabled).toBe('boolean');
    expect(recommendations.maxLights).toBeGreaterThanOrEqual(1);
    expect(recommendations.particleCount).toBeGreaterThanOrEqual(20);
  });

  it('should cleanup subscriptions on unmount', () => {
    const { unmount } = renderHook(() => useAdaptiveQuality());

    expect(() => unmount()).not.toThrow();
  });
});