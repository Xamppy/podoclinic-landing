/**
 * React hook for device-specific performance optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  detectDeviceCapabilities, 
  getRecommendedPreset, 
  applyMobileOptimizations,
  DeviceCapabilities, 
  PerformancePreset 
} from '../lib/deviceDetection';
import { 
  PerformanceManager, 
  createPerformanceManager, 
  PerformanceMetrics 
} from '../lib/performanceManager';

export interface PerformanceOptimizationState {
  capabilities: DeviceCapabilities | null;
  currentPreset: PerformancePreset | null;
  metrics: PerformanceMetrics | null;
  isMonitoring: boolean;
  isLoading: boolean;
}

export interface PerformanceOptimizationControls {
  startMonitoring: () => void;
  stopMonitoring: () => void;
  setPreset: (preset: PerformancePreset) => void;
  forceEvaluation: () => void;
  getOptimizedSettings: () => OptimizedSettings;
}

export interface OptimizedSettings {
  shouldRenderParticles: boolean;
  particleCount: number;
  enableShadows: boolean;
  textureQuality: number;
  geometryLOD: number;
  enablePostProcessing: boolean;
  maxLights: number;
  enableInstancing: boolean;
}

export function usePerformanceOptimization(): [
  PerformanceOptimizationState,
  PerformanceOptimizationControls
] {
  const [state, setState] = useState<PerformanceOptimizationState>({
    capabilities: null,
    currentPreset: null,
    metrics: null,
    isMonitoring: false,
    isLoading: true,
  });

  const performanceManagerRef = useRef<PerformanceManager | null>(null);

  // Initialize device detection and performance manager
  useEffect(() => {
    const initializePerformance = async () => {
      try {
        // Detect device capabilities
        const capabilities = detectDeviceCapabilities();
        
        // Get recommended preset
        let recommendedPreset = getRecommendedPreset(capabilities);
        
        // Apply mobile optimizations if needed
        if (capabilities.isMobile) {
          recommendedPreset = applyMobileOptimizations(recommendedPreset);
        }

        // Create performance manager
        const manager = createPerformanceManager(capabilities, recommendedPreset);
        performanceManagerRef.current = manager;

        // Set up performance change listener
        const unsubscribe = manager.onPerformanceChange((preset, metrics) => {
          setState(prev => ({
            ...prev,
            currentPreset: preset,
            metrics,
          }));
        });

        // Update state
        setState(prev => ({
          ...prev,
          capabilities,
          currentPreset: recommendedPreset,
          isLoading: false,
        }));

        // Cleanup function
        return () => {
          unsubscribe();
          manager.stopMonitoring();
        };
      } catch (error) {
        console.error('Failed to initialize performance optimization:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    const cleanup = initializePerformance();
    
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (performanceManagerRef.current && !state.isMonitoring) {
      performanceManagerRef.current.startMonitoring();
      setState(prev => ({ ...prev, isMonitoring: true }));
    }
  }, [state.isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (performanceManagerRef.current && state.isMonitoring) {
      performanceManagerRef.current.stopMonitoring();
      setState(prev => ({ ...prev, isMonitoring: false }));
    }
  }, [state.isMonitoring]);

  // Set preset manually
  const setPreset = useCallback((preset: PerformancePreset) => {
    if (performanceManagerRef.current) {
      performanceManagerRef.current.setPreset(preset);
      setState(prev => ({ ...prev, currentPreset: preset }));
    }
  }, []);

  // Force performance evaluation
  const forceEvaluation = useCallback(() => {
    if (performanceManagerRef.current) {
      performanceManagerRef.current.evaluatePerformance();
    }
  }, []);

  // Get optimized settings based on current preset
  const getOptimizedSettings = useCallback((): OptimizedSettings => {
    const preset = state.currentPreset;
    const capabilities = state.capabilities;

    if (!preset || !capabilities) {
      // Return safe defaults
      return {
        shouldRenderParticles: false,
        particleCount: 0,
        enableShadows: false,
        textureQuality: 0.5,
        geometryLOD: 0.5,
        enablePostProcessing: false,
        maxLights: 1,
        enableInstancing: false,
      };
    }

    return {
      shouldRenderParticles: preset.maxParticles > 0,
      particleCount: preset.maxParticles,
      enableShadows: preset.shadowQuality !== 'off',
      textureQuality: preset.textureQuality,
      geometryLOD: preset.geometryDetail,
      enablePostProcessing: preset.enablePostProcessing && capabilities.supportedFeatures.webgl2,
      maxLights: preset.maxLights,
      enableInstancing: preset.enableInstancing && capabilities.supportedFeatures.instancedArrays,
    };
  }, [state.currentPreset, state.capabilities]);

  const controls: PerformanceOptimizationControls = {
    startMonitoring,
    stopMonitoring,
    setPreset,
    forceEvaluation,
    getOptimizedSettings,
  };

  return [state, controls];
}

/**
 * Hook for getting device-specific mobile optimizations
 */
export function useMobileOptimizations() {
  const [{ capabilities, currentPreset }] = usePerformanceOptimization();

  return {
    isMobile: capabilities?.isMobile ?? false,
    isLowEnd: capabilities?.isLowEnd ?? false,
    shouldReduceAnimations: capabilities?.isMobile || capabilities?.isLowEnd,
    shouldDisableParticles: capabilities?.isLowEnd,
    recommendedParticleCount: currentPreset?.maxParticles ?? 0,
    shouldUseSimpleMaterials: capabilities?.gpu === 'low',
  };
}

/**
 * Hook for performance-aware rendering decisions
 */
export function usePerformanceAwareRendering() {
  const [{ currentPreset, capabilities, metrics }] = usePerformanceOptimization();

  const shouldRender = useCallback((feature: keyof OptimizedSettings): boolean => {
    if (!currentPreset || !capabilities) return false;

    switch (feature) {
      case 'shouldRenderParticles':
        return currentPreset.maxParticles > 0 && !capabilities.isLowEnd;
      case 'enableShadows':
        return currentPreset.shadowQuality !== 'off' && capabilities.gpu !== 'low';
      case 'enablePostProcessing':
        return currentPreset.enablePostProcessing && capabilities.supportedFeatures.webgl2;
      case 'enableInstancing':
        return currentPreset.enableInstancing && capabilities.supportedFeatures.instancedArrays;
      default:
        return true;
    }
  }, [currentPreset, capabilities]);

  const getQualityLevel = useCallback((feature: 'texture' | 'geometry' | 'shadow'): number => {
    if (!currentPreset) return 0.5;

    switch (feature) {
      case 'texture':
        return currentPreset.textureQuality;
      case 'geometry':
        return currentPreset.geometryDetail;
      case 'shadow':
        return currentPreset.shadowQuality === 'high' ? 1.0 : 
               currentPreset.shadowQuality === 'medium' ? 0.5 : 0.0;
      default:
        return 0.5;
    }
  }, [currentPreset]);

  return {
    shouldRender,
    getQualityLevel,
    isPerformanceGood: (metrics?.averageFPS ?? 0) >= (currentPreset?.targetFPS ?? 30) * 0.8,
    currentFPS: metrics?.fps ?? 0,
  };
}