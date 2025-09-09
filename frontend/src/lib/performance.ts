'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PerformanceRecommendations {
  pixelRatio: number;
  antialias: boolean;
  shadowMapEnabled: boolean;
  maxLights: number;
  particleCount: number;
  geometryDetail: number;
  animationQuality: number;
}

export type QualityLevel = 'low' | 'medium' | 'high';

export interface AdaptiveQualityState {
  fps: number;
  qualityLevel: QualityLevel;
  recommendations: PerformanceRecommendations;
  averageFPS: number;
}

/**
 * Performance monitoring and adaptive quality system
 * Automatically adjusts rendering quality based on device capabilities and performance
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private readonly maxHistoryLength = 60; // 1 second at 60fps
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measureFrame(): number {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= 1000) { // Calculate FPS every second
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      return fps;
    }
    
    return this.getAverageFPS();
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60; // Default assumption
    
    const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getCurrentFPS(): number {
    return this.fpsHistory[this.fpsHistory.length - 1] || 60;
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
  }
}

/**
 * Device capability detection for performance optimization
 */
function detectDeviceCapabilities() {
  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Estimate device tier based on various factors
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4; // GB
  
  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  const gl2 = canvas.getContext('webgl2');
  
  let gpuTier: 'low' | 'medium' | 'high' = 'medium';
  
  if (gl) {
    const renderer = gl.getParameter(gl.RENDERER) || '';
    
    // Basic GPU tier detection (simplified)
    if (renderer.includes('Intel HD') || renderer.includes('Mali-400')) {
      gpuTier = 'low';
    } else if (renderer.includes('GTX') || renderer.includes('RTX') || renderer.includes('Radeon')) {
      gpuTier = 'high';
    }
  }
  
  canvas.remove();
  
  return {
    isMobile,
    hardwareConcurrency,
    deviceMemory,
    hasWebGL2: !!gl2,
    gpuTier,
  };
}

/**
 * Generate performance recommendations based on device capabilities and current FPS
 */
function generateRecommendations(
  fps: number, 
  deviceCapabilities: ReturnType<typeof detectDeviceCapabilities>
): { qualityLevel: QualityLevel; recommendations: PerformanceRecommendations } {
  const { isMobile, gpuTier, deviceMemory, hardwareConcurrency } = deviceCapabilities;
  
  // Determine quality level based on FPS and device capabilities
  let qualityLevel: QualityLevel;
  
  if (fps >= 55 && !isMobile && gpuTier === 'high' && deviceMemory >= 8) {
    qualityLevel = 'high';
  } else if (fps >= 30 && (!isMobile || gpuTier !== 'low') && deviceMemory >= 4) {
    qualityLevel = 'medium';
  } else {
    qualityLevel = 'low';
  }
  
  // Generate recommendations based on quality level
  const recommendations: PerformanceRecommendations = {
    pixelRatio: qualityLevel === 'high' ? 2 : qualityLevel === 'medium' ? 1.5 : 1,
    antialias: qualityLevel === 'high',
    shadowMapEnabled: qualityLevel === 'high',
    maxLights: qualityLevel === 'high' ? 4 : qualityLevel === 'medium' ? 2 : 1,
    particleCount: qualityLevel === 'high' ? 100 : qualityLevel === 'medium' ? 50 : 20,
    geometryDetail: qualityLevel === 'high' ? 1.0 : qualityLevel === 'medium' ? 0.7 : 0.4,
    animationQuality: qualityLevel === 'high' ? 1.0 : qualityLevel === 'medium' ? 0.7 : 0.5,
  };
  
  // Additional mobile optimizations
  if (isMobile) {
    recommendations.pixelRatio = Math.min(recommendations.pixelRatio, window.devicePixelRatio || 1);
    recommendations.particleCount = Math.floor(recommendations.particleCount * 0.6);
    recommendations.maxLights = Math.min(recommendations.maxLights, 2);
  }
  
  // Low-end device optimizations
  if (hardwareConcurrency <= 2 || deviceMemory <= 2) {
    recommendations.geometryDetail *= 0.5;
    recommendations.particleCount = Math.floor(recommendations.particleCount * 0.4);
    recommendations.antialias = false;
    recommendations.shadowMapEnabled = false;
  }
  
  return { qualityLevel, recommendations };
}

/**
 * React hook for adaptive quality management
 * Monitors performance and adjusts quality settings automatically
 */
export function useAdaptiveQuality(): AdaptiveQualityState {
  const [state, setState] = useState<AdaptiveQualityState>(() => {
    const deviceCapabilities = detectDeviceCapabilities();
    const { qualityLevel, recommendations } = generateRecommendations(60, deviceCapabilities);
    
    return {
      fps: 60,
      qualityLevel,
      recommendations,
      averageFPS: 60,
    };
  });
  
  const monitor = PerformanceMonitor.getInstance();
  
  const updateQuality = useCallback(() => {
    const currentFPS = monitor.measureFrame();
    const averageFPS = monitor.getAverageFPS();
    const deviceCapabilities = detectDeviceCapabilities();
    
    const { qualityLevel, recommendations } = generateRecommendations(averageFPS, deviceCapabilities);
    
    setState(prevState => {
      // Only update if there's a significant change to avoid thrashing
      if (
        Math.abs(prevState.fps - currentFPS) > 5 ||
        prevState.qualityLevel !== qualityLevel
      ) {
        return {
          fps: currentFPS,
          qualityLevel,
          recommendations,
          averageFPS,
        };
      }
      
      return {
        ...prevState,
        fps: currentFPS,
        averageFPS,
      };
    });
  }, [monitor]);
  
  useEffect(() => {
    // Update quality every frame (throttled internally by monitor)
    let animationFrame: number;
    
    const tick = () => {
      updateQuality();
      animationFrame = requestAnimationFrame(tick);
    };
    
    animationFrame = requestAnimationFrame(tick);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [updateQuality]);
  
  return state;
}

/**
 * Hook for checking if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return reducedMotion;
}

/**
 * Initialize Web Vitals measurement
 * Measures Core Web Vitals for performance monitoring
 */
export function measureWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  // Simple performance measurement
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Log performance metrics (in production, send to analytics)
      console.log(`${entry.name}: ${entry.duration}ms`);
    }
  });
  
  // Observe navigation and resource timing
  try {
    observer.observe({ entryTypes: ['navigation', 'resource'] });
  } catch (error) {
    // Fallback for browsers that don't support all entry types
    console.warn('Performance observer not fully supported:', error);
  }
}