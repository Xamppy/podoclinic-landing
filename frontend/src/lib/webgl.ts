/**
 * WebGL capability detection and utilities
 */

import React from 'react';

export interface WebGLCapabilities {
  supported: boolean;
  version: 'webgl' | 'webgl2' | null;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  extensions: string[];
  renderer: string;
  vendor: string;
}

/**
 * Detect WebGL support and capabilities
 */
export function detectWebGLSupport(): WebGLCapabilities {
  const canvas = document.createElement('canvas');
  
  // Try WebGL2 first, then WebGL1
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let version: 'webgl' | 'webgl2' | null = null;

  try {
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (gl) {
      version = 'webgl2';
    } else {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
      if (gl) {
        version = 'webgl';
      }
    }
  } catch (e) {
    console.warn('WebGL context creation failed:', e);
  }

  if (!gl) {
    return {
      supported: false,
      version: null,
      maxTextureSize: 0,
      maxVertexUniforms: 0,
      maxFragmentUniforms: 0,
      extensions: [],
      renderer: 'Unknown',
      vendor: 'Unknown',
    };
  }

  // Get capabilities
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const extensions = gl.getSupportedExtensions() || [];

  const capabilities: WebGLCapabilities = {
    supported: true,
    version,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0,
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 0,
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0,
    extensions,
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown' : 'Unknown',
    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown' : 'Unknown',
  };

  // Clean up
  canvas.remove();

  return capabilities;
}

/**
 * Check if device has sufficient WebGL capabilities for 3D rendering
 */
export function hasMinimumWebGLCapabilities(): boolean {
  const capabilities = detectWebGLSupport();
  
  if (!capabilities.supported) {
    return false;
  }

  // Minimum requirements for our 3D scene
  const minimumRequirements = {
    maxTextureSize: 512, // Very conservative
    maxVertexUniforms: 128,
    maxFragmentUniforms: 16,
  };

  return (
    capabilities.maxTextureSize >= minimumRequirements.maxTextureSize &&
    capabilities.maxVertexUniforms >= minimumRequirements.maxVertexUniforms &&
    capabilities.maxFragmentUniforms >= minimumRequirements.maxFragmentUniforms
  );
}

/**
 * Get performance tier based on WebGL capabilities
 */
export function getPerformanceTier(): 'high' | 'medium' | 'low' {
  const capabilities = detectWebGLSupport();
  
  if (!capabilities.supported) {
    return 'low';
  }

  // High-end: WebGL2 support, large texture size, modern GPU
  if (
    capabilities.version === 'webgl2' &&
    capabilities.maxTextureSize >= 4096 &&
    capabilities.extensions.includes('EXT_color_buffer_float')
  ) {
    return 'high';
  }

  // Medium: WebGL1 with good capabilities
  if (
    capabilities.maxTextureSize >= 2048 &&
    capabilities.maxVertexUniforms >= 256
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook for detecting reduced motion preference with reactive updates
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return reducedMotion;
}