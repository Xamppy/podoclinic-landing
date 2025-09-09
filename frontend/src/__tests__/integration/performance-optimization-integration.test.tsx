/**
 * Integration test for performance optimization system
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

// Mock the device detection and performance manager
jest.mock('../../lib/deviceDetection', () => ({
  detectDeviceCapabilities: jest.fn(() => ({
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
  })),
  getRecommendedPreset: jest.fn(() => ({
    name: 'medium',
    targetFPS: 30,
    maxParticles: 100,
    enablePostProcessing: false,
    shadowQuality: 'medium',
    textureQuality: 1.0,
    geometryDetail: 0.7,
    enableInstancing: true,
    maxLights: 2,
  })),
  applyMobileOptimizations: jest.fn((preset) => preset),
  PERFORMANCE_PRESETS: {
    high: { name: 'high', targetFPS: 60, maxParticles: 200, enablePostProcessing: true, shadowQuality: 'high', textureQuality: 2.0, geometryDetail: 1.0, enableInstancing: true, maxLights: 4 },
    medium: { name: 'medium', targetFPS: 30, maxParticles: 100, enablePostProcessing: false, shadowQuality: 'medium', textureQuality: 1.0, geometryDetail: 0.7, enableInstancing: true, maxLights: 2 },
    low: { name: 'low', targetFPS: 24, maxParticles: 50, enablePostProcessing: false, shadowQuality: 'off', textureQuality: 0.5, geometryDetail: 0.5, enableInstancing: false, maxLights: 1 },
  },
}));

jest.mock('../../lib/performanceManager', () => ({
  createPerformanceManager: jest.fn(() => ({
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    setPreset: jest.fn(),
    evaluatePerformance: jest.fn(),
    onPerformanceChange: jest.fn(() => jest.fn()),
    getCurrentPreset: jest.fn(() => ({
      name: 'medium',
      targetFPS: 30,
      maxParticles: 100,
      enablePostProcessing: false,
      shadowQuality: 'medium',
      textureQuality: 1.0,
      geometryDetail: 0.7,
      enableInstancing: true,
      maxLights: 2,
    })),
    getMetrics: jest.fn(() => ({
      fps: 30,
      frameTime: 16.67,
      averageFPS: 30,
      droppedFrames: 0,
      memoryUsage: 50,
    })),
  })),
  PerformanceManager: jest.fn(),
}));

// Test component that uses performance optimization
function TestComponent() {
  const [state, controls] = usePerformanceOptimization();

  if (state.isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  const settings = controls.getOptimizedSettings();

  return (
    <div data-testid="performance-info">
      <div data-testid="device-type">{state.capabilities?.deviceType}</div>
      <div data-testid="gpu-tier">{state.capabilities?.gpu}</div>
      <div data-testid="preset-name">{state.currentPreset?.name}</div>
      <div data-testid="particle-count">{settings.particleCount}</div>
      <div data-testid="enable-shadows">{settings.enableShadows.toString()}</div>
      <div data-testid="enable-instancing">{settings.enableInstancing.toString()}</div>
      <button 
        data-testid="start-monitoring" 
        onClick={controls.startMonitoring}
      >
        Start Monitoring
      </button>
      <button 
        data-testid="stop-monitoring" 
        onClick={controls.stopMonitoring}
      >
        Stop Monitoring
      </button>
    </div>
  );
}

describe('Performance Optimization Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize and display device capabilities', async () => {
    render(<TestComponent />);

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for initialization
    await screen.findByTestId('performance-info');

    // Should display device information
    expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
    expect(screen.getByTestId('gpu-tier')).toHaveTextContent('medium');
    expect(screen.getByTestId('preset-name')).toHaveTextContent('medium');
  });

  it('should provide optimized settings based on device capabilities', async () => {
    render(<TestComponent />);

    await screen.findByTestId('performance-info');

    // Should provide appropriate settings for medium preset
    expect(screen.getByTestId('particle-count')).toHaveTextContent('100');
    expect(screen.getByTestId('enable-shadows')).toHaveTextContent('true');
    expect(screen.getByTestId('enable-instancing')).toHaveTextContent('true');
  });

  it('should provide monitoring controls', async () => {
    render(<TestComponent />);

    await screen.findByTestId('performance-info');

    // Should have monitoring controls
    expect(screen.getByTestId('start-monitoring')).toBeInTheDocument();
    expect(screen.getByTestId('stop-monitoring')).toBeInTheDocument();
  });

  it('should handle performance optimization lifecycle', async () => {
    const { unmount } = render(<TestComponent />);

    await screen.findByTestId('performance-info');

    // Should cleanup on unmount
    unmount();
    
    // No errors should be thrown during cleanup
    expect(true).toBe(true);
  });
});

describe('Performance Optimization Error Handling', () => {
  it('should handle initialization errors gracefully', async () => {
    // Mock an error in device detection
    const mockDetection = require('../../lib/deviceDetection');
    mockDetection.detectDeviceCapabilities.mockImplementation(() => {
      throw new Error('Detection failed');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TestComponent />);

    // Should eventually show some content even with errors
    await screen.findByTestId('performance-info');

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});