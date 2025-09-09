/**
 * Tests for usePerformanceOptimization hook
 */

import { renderHook, act } from '@testing-library/react';
import { usePerformanceOptimization, useMobileOptimizations, usePerformanceAwareRendering } from '../usePerformanceOptimization';
import * as deviceDetection from '../../lib/deviceDetection';
import * as performanceManager from '../../lib/performanceManager';

// Mock the device detection and performance manager modules
jest.mock('../../lib/deviceDetection');
jest.mock('../../lib/performanceManager');

const mockDeviceDetection = deviceDetection as jest.Mocked<typeof deviceDetection>;
const mockPerformanceManager = performanceManager as jest.Mocked<typeof performanceManager>;

describe('usePerformanceOptimization', () => {
  const mockCapabilities: deviceDetection.DeviceCapabilities = {
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

  const mockPreset: deviceDetection.PerformancePreset = {
    name: 'medium',
    targetFPS: 30,
    maxParticles: 100,
    enablePostProcessing: false,
    shadowQuality: 'medium',
    textureQuality: 1.0,
    geometryDetail: 0.7,
    enableInstancing: true,
    maxLights: 2,
  };

  const mockManager = {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    setPreset: jest.fn(),
    evaluatePerformance: jest.fn(),
    onPerformanceChange: jest.fn(() => jest.fn()), // Returns unsubscribe function
    getCurrentPreset: jest.fn(() => mockPreset),
    getMetrics: jest.fn(() => ({
      fps: 30,
      frameTime: 16.67,
      averageFPS: 30,
      droppedFrames: 0,
      memoryUsage: 50,
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDeviceDetection.detectDeviceCapabilities.mockReturnValue(mockCapabilities);
    mockDeviceDetection.getRecommendedPreset.mockReturnValue(mockPreset);
    mockDeviceDetection.applyMobileOptimizations.mockReturnValue(mockPreset);
    mockPerformanceManager.createPerformanceManager.mockReturnValue(mockManager as any);
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => usePerformanceOptimization());
      
      expect(result.current[0].isLoading).toBe(true);
      expect(result.current[0].capabilities).toBe(null);
      expect(result.current[0].currentPreset).toBe(null);
    });

    it('should detect device capabilities on mount', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      expect(mockDeviceDetection.detectDeviceCapabilities).toHaveBeenCalled();
      expect(mockDeviceDetection.getRecommendedPreset).toHaveBeenCalledWith(mockCapabilities);
      expect(result.current[0].capabilities).toEqual(mockCapabilities);
      expect(result.current[0].currentPreset).toEqual(mockPreset);
      expect(result.current[0].isLoading).toBe(false);
    });

    it('should apply mobile optimizations for mobile devices', async () => {
      const mobileCapabilities = { ...mockCapabilities, isMobile: true };
      mockDeviceDetection.detectDeviceCapabilities.mockReturnValue(mobileCapabilities);
      
      const { waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      expect(mockDeviceDetection.applyMobileOptimizations).toHaveBeenCalledWith(mockPreset);
    });

    it('should create performance manager with correct parameters', async () => {
      const { waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      expect(mockPerformanceManager.createPerformanceManager).toHaveBeenCalledWith(
        mockCapabilities,
        mockPreset
      );
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDeviceDetection.detectDeviceCapabilities.mockImplementation(() => {
        throw new Error('Detection failed');
      });
      
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      expect(result.current[0].isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize performance optimization:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('monitoring controls', () => {
    it('should start monitoring when requested', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      act(() => {
        result.current[1].startMonitoring();
      });
      
      expect(mockManager.startMonitoring).toHaveBeenCalled();
      expect(result.current[0].isMonitoring).toBe(true);
    });

    it('should stop monitoring when requested', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      act(() => {
        result.current[1].startMonitoring();
      });
      
      act(() => {
        result.current[1].stopMonitoring();
      });
      
      expect(mockManager.stopMonitoring).toHaveBeenCalled();
      expect(result.current[0].isMonitoring).toBe(false);
    });

    it('should set preset manually', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      const newPreset = { ...mockPreset, name: 'high' as const };
      
      act(() => {
        result.current[1].setPreset(newPreset);
      });
      
      expect(mockManager.setPreset).toHaveBeenCalledWith(newPreset);
    });

    it('should force performance evaluation', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      act(() => {
        result.current[1].forceEvaluation();
      });
      
      expect(mockManager.evaluatePerformance).toHaveBeenCalled();
    });
  });

  describe('optimized settings', () => {
    it('should return optimized settings based on current preset', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      const settings = result.current[1].getOptimizedSettings();
      
      expect(settings).toEqual({
        shouldRenderParticles: true, // maxParticles > 0
        particleCount: 100,
        enableShadows: true, // shadowQuality !== 'off'
        textureQuality: 1.0,
        geometryLOD: 0.7,
        enablePostProcessing: false, // preset.enablePostProcessing && webgl2
        maxLights: 2,
        enableInstancing: true, // preset.enableInstancing && instancedArrays
      });
    });

    it('should return safe defaults when not initialized', () => {
      const { result } = renderHook(() => usePerformanceOptimization());
      
      const settings = result.current[1].getOptimizedSettings();
      
      expect(settings).toEqual({
        shouldRenderParticles: false,
        particleCount: 0,
        enableShadows: false,
        textureQuality: 0.5,
        geometryLOD: 0.5,
        enablePostProcessing: false,
        maxLights: 1,
        enableInstancing: false,
      });
    });

    it('should disable post-processing when WebGL2 is not supported', async () => {
      const capabilitiesWithoutWebGL2 = {
        ...mockCapabilities,
        supportedFeatures: {
          ...mockCapabilities.supportedFeatures,
          webgl2: false,
        },
      };
      mockDeviceDetection.detectDeviceCapabilities.mockReturnValue(capabilitiesWithoutWebGL2);
      
      const { result, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      const settings = result.current[1].getOptimizedSettings();
      
      expect(settings.enablePostProcessing).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', async () => {
      const unsubscribeMock = jest.fn();
      mockManager.onPerformanceChange.mockReturnValue(unsubscribeMock);
      
      const { unmount, waitForNextUpdate } = renderHook(() => usePerformanceOptimization());
      
      await waitForNextUpdate();
      
      unmount();
      
      expect(unsubscribeMock).toHaveBeenCalled();
      expect(mockManager.stopMonitoring).toHaveBeenCalled();
    });
  });
});

describe('useMobileOptimizations', () => {
  it('should return mobile optimization flags', () => {
    // Mock the main hook to return mobile capabilities
    const mockState = {
      capabilities: {
        isMobile: true,
        isLowEnd: true,
        gpu: 'low' as const,
      },
      currentPreset: {
        maxParticles: 50,
      },
    };
    
    jest.spyOn(require('../usePerformanceOptimization'), 'usePerformanceOptimization')
      .mockReturnValue([mockState, {}]);
    
    const { result } = renderHook(() => useMobileOptimizations());
    
    expect(result.current).toEqual({
      isMobile: true,
      isLowEnd: true,
      shouldReduceAnimations: true,
      shouldDisableParticles: true,
      recommendedParticleCount: 50,
      shouldUseSimpleMaterials: true,
    });
  });
});

describe('usePerformanceAwareRendering', () => {
  it('should provide rendering decisions based on performance', () => {
    const mockState = {
      capabilities: {
        gpu: 'medium' as const,
        isLowEnd: false,
        supportedFeatures: {
          webgl2: true,
          instancedArrays: true,
        },
      },
      currentPreset: {
        maxParticles: 100,
        shadowQuality: 'medium' as const,
        enablePostProcessing: true,
        enableInstancing: true,
        targetFPS: 30,
        textureQuality: 1.0,
        geometryDetail: 0.7,
      },
      metrics: {
        averageFPS: 35,
        fps: 35,
      },
    };
    
    jest.spyOn(require('../usePerformanceOptimization'), 'usePerformanceOptimization')
      .mockReturnValue([mockState, {}]);
    
    const { result } = renderHook(() => usePerformanceAwareRendering());
    
    expect(result.current.shouldRender('shouldRenderParticles')).toBe(true);
    expect(result.current.shouldRender('enableShadows')).toBe(true);
    expect(result.current.shouldRender('enablePostProcessing')).toBe(true);
    expect(result.current.shouldRender('enableInstancing')).toBe(true);
    
    expect(result.current.getQualityLevel('texture')).toBe(1.0);
    expect(result.current.getQualityLevel('geometry')).toBe(0.7);
    expect(result.current.getQualityLevel('shadow')).toBe(0.5);
    
    expect(result.current.isPerformanceGood).toBe(true);
    expect(result.current.currentFPS).toBe(35);
  });
});