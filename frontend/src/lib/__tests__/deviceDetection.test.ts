/**
 * Tests for device detection and performance optimization utilities
 */

import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import {
  detectDeviceCapabilities,
  getRecommendedPreset,
  applyMobileOptimizations,
  PERFORMANCE_PRESETS,
  type DeviceCapabilities,
  type GPUTier,
} from '../deviceDetection';

// Mock navigator and WebGL context
const mockNavigator = {
  userAgent: '',
  hardwareConcurrency: 4,
};

const mockWebGLContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn(),
};

// Mock canvas and WebGL
const mockCanvas = {
  getContext: jest.fn(),
};

// Mock globals safely
(global as any).navigator = mockNavigator;
(global as any).document = {
  createElement: jest.fn(() => mockCanvas),
};

describe('deviceDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    mockCanvas.getContext.mockReturnValue(mockWebGLContext);
    mockWebGLContext.getExtension.mockReturnValue(null);
    mockWebGLContext.getParameter.mockReturnValue('Intel HD Graphics');
  });

  describe('detectDeviceCapabilities', () => {
    it('should detect desktop device correctly', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.deviceType).toBe('desktop');
      expect(capabilities.isMobile).toBe(false);
    });

    it('should detect mobile device correctly', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.deviceType).toBe('mobile');
      expect(capabilities.isMobile).toBe(true);
    });

    it('should detect tablet device correctly', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.deviceType).toBe('tablet');
      expect(capabilities.isMobile).toBe(false);
    });

    it('should detect WebGL support', () => {
      mockCanvas.getContext.mockReturnValue(mockWebGLContext);
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.supportedFeatures.webgl).toBe(true);
    });

    it('should detect WebGL2 support', () => {
      mockCanvas.getContext
        .mockReturnValueOnce(mockWebGLContext) // webgl
        .mockReturnValueOnce(mockWebGLContext); // webgl2
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.supportedFeatures.webgl2).toBe(true);
    });

    it('should detect instanced arrays support', () => {
      mockWebGLContext.getExtension.mockImplementation((ext: string) => {
        return ext === 'ANGLE_instanced_arrays' ? {} : null;
      });
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.supportedFeatures.instancedArrays).toBe(true);
    });

    it('should detect high-end GPU', () => {
      mockWebGLContext.getExtension.mockImplementation((ext: string) => {
        return ext === 'WEBGL_debug_renderer_info' ? { 
          UNMASKED_RENDERER_WEBGL: 37446 
        } : null;
      });
      mockWebGLContext.getParameter.mockReturnValue('NVIDIA GeForce RTX 3080');
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.gpu).toBe('high');
    });

    it('should detect low-end GPU', () => {
      mockWebGLContext.getExtension.mockImplementation((ext: string) => {
        return ext === 'WEBGL_debug_renderer_info' ? { 
          UNMASKED_RENDERER_WEBGL: 37446 
        } : null;
      });
      mockWebGLContext.getParameter.mockReturnValue('Intel HD Graphics 4000');
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.gpu).toBe('low');
    });

    it('should mark device as low-end based on criteria', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)';
      mockNavigator.hardwareConcurrency = 2;
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.isLowEnd).toBe(true);
    });
  });

  describe('getRecommendedPreset', () => {
    it('should recommend high preset for high-end desktop', () => {
      const capabilities: DeviceCapabilities = {
        gpu: 'high',
        memory: 16,
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
      
      const preset = getRecommendedPreset(capabilities);
      
      expect(preset.name).toBe('high');
    });

    it('should recommend low preset for low-end devices', () => {
      const capabilities: DeviceCapabilities = {
        gpu: 'low',
        memory: 2,
        deviceType: 'mobile',
        isMobile: true,
        isLowEnd: true,
        supportedFeatures: {
          webgl: true,
          webgl2: false,
          instancedArrays: false,
          floatTextures: false,
        },
      };
      
      const preset = getRecommendedPreset(capabilities);
      
      expect(preset.name).toBe('low');
    });

    it('should recommend medium preset for mid-range devices', () => {
      const capabilities: DeviceCapabilities = {
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
      
      const preset = getRecommendedPreset(capabilities);
      
      expect(preset.name).toBe('medium');
    });
  });

  describe('applyMobileOptimizations', () => {
    it('should reduce particle count for mobile', () => {
      const originalPreset = PERFORMANCE_PRESETS.high;
      const optimized = applyMobileOptimizations(originalPreset);
      
      expect(optimized.maxParticles).toBe(Math.floor(originalPreset.maxParticles * 0.5));
    });

    it('should disable post-processing for mobile', () => {
      const originalPreset = PERFORMANCE_PRESETS.high;
      const optimized = applyMobileOptimizations(originalPreset);
      
      expect(optimized.enablePostProcessing).toBe(false);
    });

    it('should reduce texture quality for mobile', () => {
      const originalPreset = PERFORMANCE_PRESETS.high;
      const optimized = applyMobileOptimizations(originalPreset);
      
      expect(optimized.textureQuality).toBeLessThanOrEqual(1.0);
    });

    it('should reduce geometry detail for mobile', () => {
      const originalPreset = PERFORMANCE_PRESETS.high;
      const optimized = applyMobileOptimizations(originalPreset);
      
      expect(optimized.geometryDetail).toBe(originalPreset.geometryDetail * 0.8);
    });

    it('should limit lights for mobile', () => {
      const originalPreset = PERFORMANCE_PRESETS.high;
      const optimized = applyMobileOptimizations(originalPreset);
      
      expect(optimized.maxLights).toBeLessThanOrEqual(2);
    });
  });

  describe('PERFORMANCE_PRESETS', () => {
    it('should have all required presets', () => {
      expect(PERFORMANCE_PRESETS.high).toBeDefined();
      expect(PERFORMANCE_PRESETS.medium).toBeDefined();
      expect(PERFORMANCE_PRESETS.low).toBeDefined();
    });

    it('should have decreasing performance targets', () => {
      expect(PERFORMANCE_PRESETS.high.targetFPS).toBeGreaterThan(PERFORMANCE_PRESETS.medium.targetFPS);
      expect(PERFORMANCE_PRESETS.medium.targetFPS).toBeGreaterThan(PERFORMANCE_PRESETS.low.targetFPS);
    });

    it('should have decreasing particle counts', () => {
      expect(PERFORMANCE_PRESETS.high.maxParticles).toBeGreaterThan(PERFORMANCE_PRESETS.medium.maxParticles);
      expect(PERFORMANCE_PRESETS.medium.maxParticles).toBeGreaterThan(PERFORMANCE_PRESETS.low.maxParticles);
    });

    it('should have appropriate quality settings', () => {
      expect(PERFORMANCE_PRESETS.high.enablePostProcessing).toBe(true);
      expect(PERFORMANCE_PRESETS.low.enablePostProcessing).toBe(false);
      expect(PERFORMANCE_PRESETS.low.shadowQuality).toBe('off');
    });
  });
});