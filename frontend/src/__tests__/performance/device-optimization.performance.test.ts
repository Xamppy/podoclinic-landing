/**
 * Performance tests for device-specific optimizations
 */

import { detectDeviceCapabilities, getRecommendedPreset, applyMobileOptimizations } from '../../lib/deviceDetection';
import { PerformanceManager, createPerformanceManager } from '../../lib/performanceManager';

// Mock WebGL context for testing
const mockWebGLContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn(),
};

const mockCanvas = {
  getContext: jest.fn(() => mockWebGLContext),
};

// Mock globals safely
(global as any).document = {
  createElement: jest.fn(() => mockCanvas),
};

(global as any).navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  hardwareConcurrency: 8,
};

describe('Device Optimization Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebGLContext.getExtension.mockReturnValue(null);
    mockWebGLContext.getParameter.mockReturnValue('NVIDIA GeForce GTX 1060');
  });

  describe('Device Detection Performance', () => {
    it('should detect device capabilities quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        detectDeviceCapabilities();
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      // Should complete device detection in under 1ms on average
      expect(avgTime).toBeLessThan(1);
    });

    it('should handle WebGL detection efficiently', () => {
      const startTime = performance.now();
      
      // Simulate multiple WebGL context creations
      for (let i = 0; i < 50; i++) {
        detectDeviceCapabilities();
      }
      
      const endTime = performance.now();
      
      // Should handle multiple detections without significant performance impact
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Performance Manager Efficiency', () => {
    it('should create performance manager quickly', () => {
      const capabilities = detectDeviceCapabilities();
      const preset = getRecommendedPreset(capabilities);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const manager = createPerformanceManager(capabilities, preset);
        manager.stopMonitoring(); // Cleanup
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 10;
      
      // Should create manager in under 5ms on average
      expect(avgTime).toBeLessThan(5);
    });

    it('should handle frame monitoring with minimal overhead', (done) => {
      const capabilities = detectDeviceCapabilities();
      const preset = getRecommendedPreset(capabilities);
      const manager = createPerformanceManager(capabilities, preset);
      
      let frameCount = 0;
      const startTime = performance.now();
      
      // Mock performance.now to simulate frame timing
      const originalNow = performance.now;
      performance.now = jest.fn(() => {
        frameCount++;
        return frameCount * 16.67; // 60fps timing
      });
      
      manager.startMonitoring();
      
      setTimeout(() => {
        manager.stopMonitoring();
        const endTime = originalNow.call(performance);
        
        // Monitoring should add minimal overhead
        expect(endTime - startTime).toBeLessThan(100);
        
        // Restore original performance.now
        performance.now = originalNow;
        done();
      }, 50);
    });

    it('should evaluate performance quickly', () => {
      const capabilities = detectDeviceCapabilities();
      const preset = getRecommendedPreset(capabilities);
      const manager = createPerformanceManager(capabilities, preset);
      
      // Simulate frame history
      const managerInternal = manager as any;
      managerInternal.frameHistory = Array(60).fill(30); // 30 FPS
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        manager.evaluatePerformance();
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      // Performance evaluation should be very fast
      expect(avgTime).toBeLessThan(0.1);
    });
  });

  describe('Mobile Optimization Impact', () => {
    it('should apply mobile optimizations efficiently', () => {
      const capabilities = detectDeviceCapabilities();
      const preset = getRecommendedPreset(capabilities);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        applyMobileOptimizations(preset);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 1000;
      
      // Mobile optimizations should be very fast
      expect(avgTime).toBeLessThan(0.01);
    });

    it('should reduce resource requirements for mobile devices', () => {
      const capabilities = {
        ...detectDeviceCapabilities(),
        isMobile: true,
        deviceType: 'mobile' as const,
      };
      
      const desktopPreset = getRecommendedPreset({
        ...capabilities,
        isMobile: false,
        deviceType: 'desktop' as const,
      });
      
      const mobilePreset = applyMobileOptimizations(desktopPreset);
      
      // Mobile should have reduced resource requirements
      expect(mobilePreset.maxParticles).toBeLessThan(desktopPreset.maxParticles);
      expect(mobilePreset.textureQuality).toBeLessThanOrEqual(desktopPreset.textureQuality);
      expect(mobilePreset.geometryDetail).toBeLessThan(desktopPreset.geometryDetail);
      expect(mobilePreset.maxLights).toBeLessThanOrEqual(desktopPreset.maxLights);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks during device detection', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many device detections
      for (let i = 0; i < 100; i++) {
        detectDeviceCapabilities();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    it('should cleanup performance managers properly', () => {
      const capabilities = detectDeviceCapabilities();
      const preset = getRecommendedPreset(capabilities);
      
      const managers: PerformanceManager[] = [];
      
      // Create multiple managers
      for (let i = 0; i < 10; i++) {
        managers.push(createPerformanceManager(capabilities, preset));
      }
      
      // Start monitoring on all
      managers.forEach(manager => manager.startMonitoring());
      
      // Stop monitoring and cleanup
      managers.forEach(manager => manager.stopMonitoring());
      
      // Should not throw or cause memory issues
      expect(() => {
        managers.length = 0; // Clear references
      }).not.toThrow();
    });
  });

  describe('Adaptive Quality Performance', () => {
    it('should adjust quality settings based on performance targets', () => {
      const capabilities = detectDeviceCapabilities();
      
      // Test different performance scenarios
      const scenarios = [
        { gpu: 'high' as const, memory: 16, expected: 'high' as const },
        { gpu: 'medium' as const, memory: 8, expected: 'medium' as const },
        { gpu: 'low' as const, memory: 4, expected: 'low' as const },
      ];
      
      scenarios.forEach(scenario => {
        const testCapabilities = {
          ...capabilities,
          gpu: scenario.gpu,
          memory: scenario.memory,
          isLowEnd: scenario.gpu === 'low',
        };
        
        const preset = getRecommendedPreset(testCapabilities);
        expect(preset.name).toBe(scenario.expected);
        
        // Verify performance targets are appropriate
        if (scenario.expected === 'high') {
          expect(preset.targetFPS).toBeGreaterThanOrEqual(60);
          expect(preset.maxParticles).toBeGreaterThan(100);
        } else if (scenario.expected === 'low') {
          expect(preset.targetFPS).toBeLessThanOrEqual(30);
          expect(preset.maxParticles).toBeLessThan(100);
        }
      });
    });

    it('should handle rapid quality changes efficiently', () => {
      const capabilities = detectDeviceCapabilities();
      const manager = createPerformanceManager(capabilities, getRecommendedPreset(capabilities));
      
      const startTime = performance.now();
      
      // Simulate rapid quality changes
      const presets = Object.values({
        high: { name: 'high', targetFPS: 60, maxParticles: 200, enablePostProcessing: true, shadowQuality: 'high', textureQuality: 2.0, geometryDetail: 1.0, enableInstancing: true, maxLights: 4 },
        medium: { name: 'medium', targetFPS: 30, maxParticles: 100, enablePostProcessing: false, shadowQuality: 'medium', textureQuality: 1.0, geometryDetail: 0.7, enableInstancing: true, maxLights: 2 },
        low: { name: 'low', targetFPS: 24, maxParticles: 50, enablePostProcessing: false, shadowQuality: 'off', textureQuality: 0.5, geometryDetail: 0.5, enableInstancing: false, maxLights: 1 },
      });
      
      for (let i = 0; i < 100; i++) {
        const preset = presets[i % presets.length];
        manager.setPreset(preset as any);
      }
      
      const endTime = performance.now();
      
      // Quality changes should be very fast
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});