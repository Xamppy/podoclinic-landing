/**
 * Device capability detection and performance optimization utilities
 */

export interface DeviceCapabilities {
  gpu: GPUTier;
  memory: number; // in GB
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isMobile: boolean;
  isLowEnd: boolean;
  supportedFeatures: {
    webgl: boolean;
    webgl2: boolean;
    instancedArrays: boolean;
    floatTextures: boolean;
  };
}

export type GPUTier = 'high' | 'medium' | 'low' | 'unknown';

export interface PerformancePreset {
  name: 'high' | 'medium' | 'low';
  targetFPS: number;
  maxParticles: number;
  enablePostProcessing: boolean;
  shadowQuality: 'high' | 'medium' | 'low' | 'off';
  textureQuality: number; // 0.5, 1.0, 2.0
  geometryDetail: number; // LOD multiplier
  enableInstancing: boolean;
  maxLights: number;
}

export const PERFORMANCE_PRESETS: Record<PerformancePreset['name'], PerformancePreset> = {
  high: {
    name: 'high',
    targetFPS: 60,
    maxParticles: 200,
    enablePostProcessing: true,
    shadowQuality: 'high',
    textureQuality: 2.0,
    geometryDetail: 1.0,
    enableInstancing: true,
    maxLights: 4,
  },
  medium: {
    name: 'medium',
    targetFPS: 30,
    maxParticles: 100,
    enablePostProcessing: false,
    shadowQuality: 'medium',
    textureQuality: 1.0,
    geometryDetail: 0.7,
    enableInstancing: true,
    maxLights: 2,
  },
  low: {
    name: 'low',
    targetFPS: 24,
    maxParticles: 50,
    enablePostProcessing: false,
    shadowQuality: 'off',
    textureQuality: 0.5,
    geometryDetail: 0.5,
    enableInstancing: false,
    maxLights: 1,
  },
};

/**
 * Detect device capabilities and return appropriate performance configuration
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  const gl2 = canvas.getContext('webgl2');
  
  // Detect device type
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  let deviceType: DeviceCapabilities['deviceType'] = 'desktop';
  if (isMobile && !isTablet) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';

  // Estimate memory (rough approximation)
  const memory = estimateDeviceMemory();
  
  // Detect GPU tier
  const gpuTier = detectGPUTier(gl);
  
  // Determine if device is low-end
  const isLowEnd = gpuTier === 'low' || memory < 4 || (isMobile && memory < 6);

  return {
    gpu: gpuTier,
    memory,
    deviceType,
    isMobile,
    isLowEnd,
    supportedFeatures: {
      webgl: !!gl,
      webgl2: !!gl2,
      instancedArrays: checkInstancedArraysSupport(gl),
      floatTextures: checkFloatTextureSupport(gl),
    },
  };
}

/**
 * Estimate device memory based on available APIs and heuristics
 */
function estimateDeviceMemory(): number {
  // Use Device Memory API if available
  if ('deviceMemory' in navigator) {
    return (navigator as unknown as { deviceMemory: number }).deviceMemory;
  }

  // Use hardware concurrency as a rough indicator
  const cores = navigator.hardwareConcurrency || 4;
  
  // Rough estimation based on cores and device type
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  if (isMobile) {
    return cores <= 4 ? 2 : cores <= 6 ? 4 : 6;
  } else {
    return cores <= 4 ? 4 : cores <= 8 ? 8 : 16;
  }
}

/**
 * Detect GPU performance tier based on WebGL renderer info
 */
function detectGPUTier(gl: WebGLRenderingContext | null): GPUTier {
  if (!gl) return 'unknown';

  try {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'medium';

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
    
    // High-end GPUs
    if (renderer.includes('rtx') || 
        renderer.includes('gtx 1060') || 
        renderer.includes('gtx 1070') || 
        renderer.includes('gtx 1080') ||
        renderer.includes('radeon rx') ||
        renderer.includes('apple m1') ||
        renderer.includes('apple m2')) {
      return 'high';
    }
    
    // Low-end indicators
    if (renderer.includes('intel') && 
        (renderer.includes('hd') || renderer.includes('uhd')) ||
        renderer.includes('mali') ||
        renderer.includes('adreno 3') ||
        renderer.includes('powervr')) {
      return 'low';
    }
    
    return 'medium';
  } catch (error) {
    console.warn('Could not detect GPU tier:', error);
    return 'medium';
  }
}

/**
 * Check if instanced arrays extension is supported
 */
function checkInstancedArraysSupport(gl: WebGLRenderingContext | null): boolean {
  if (!gl) return false;
  return !!gl.getExtension('ANGLE_instanced_arrays');
}

/**
 * Check if float textures are supported
 */
function checkFloatTextureSupport(gl: WebGLRenderingContext | null): boolean {
  if (!gl) return false;
  return !!gl.getExtension('OES_texture_float');
}

/**
 * Get recommended performance preset based on device capabilities
 */
export function getRecommendedPreset(capabilities: DeviceCapabilities): PerformancePreset {
  if (capabilities.isLowEnd || capabilities.gpu === 'low') {
    return PERFORMANCE_PRESETS.low;
  }
  
  if (capabilities.gpu === 'high' && capabilities.memory >= 8 && !capabilities.isMobile) {
    return PERFORMANCE_PRESETS.high;
  }
  
  return PERFORMANCE_PRESETS.medium;
}

/**
 * Apply mobile-specific optimizations to a preset
 */
export function applyMobileOptimizations(preset: PerformancePreset): PerformancePreset {
  return {
    ...preset,
    maxParticles: Math.floor(preset.maxParticles * 0.5),
    textureQuality: Math.min(preset.textureQuality, 1.0),
    geometryDetail: preset.geometryDetail * 0.8,
    enablePostProcessing: false,
    shadowQuality: preset.shadowQuality === 'high' ? 'medium' : 'off',
    maxLights: Math.min(preset.maxLights, 2),
  };
}