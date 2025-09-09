/**
 * Performance manager for automatic quality adjustment based on frame rate
 */

import { PerformancePreset, PERFORMANCE_PRESETS, DeviceCapabilities } from './deviceDetection';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  averageFPS: number;
  droppedFrames: number;
  memoryUsage?: number;
}

export interface PerformanceManagerConfig {
  targetFPS: number;
  fpsThreshold: number; // Percentage below target to trigger downgrade
  upgradeThreshold: number; // Percentage above target to trigger upgrade
  sampleSize: number; // Number of frames to average
  degradationSteps: number; // How many steps to degrade at once
}

export class PerformanceManager {
  private config: PerformanceManagerConfig;
  private currentPreset: PerformancePreset;
  private capabilities: DeviceCapabilities;
  private frameHistory: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private droppedFrames = 0;
  private isMonitoring = false;
  private callbacks: Set<(preset: PerformancePreset, metrics: PerformanceMetrics) => void> = new Set();

  constructor(
    capabilities: DeviceCapabilities,
    initialPreset: PerformancePreset,
    config: Partial<PerformanceManagerConfig> = {}
  ) {
    this.capabilities = capabilities;
    this.currentPreset = initialPreset;
    this.config = {
      targetFPS: initialPreset.targetFPS,
      fpsThreshold: 0.8, // 80% of target FPS
      upgradeThreshold: 1.1, // 110% of target FPS
      sampleSize: 60, // 1 second at 60fps
      degradationSteps: 1,
      ...config,
    };
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameHistory = [];
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.lastFrameTime = performance.now();
    
    this.monitorFrame();
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Add callback for performance changes
   */
  onPerformanceChange(callback: (preset: PerformancePreset, metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const averageFPS = this.frameHistory.length > 0 
      ? this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length
      : 0;

    return {
      fps: this.frameHistory[this.frameHistory.length - 1] || 0,
      frameTime: this.lastFrameTime,
      averageFPS,
      droppedFrames: this.droppedFrames,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get current performance preset
   */
  getCurrentPreset(): PerformancePreset {
    return this.currentPreset;
  }

  /**
   * Manually set performance preset
   */
  setPreset(preset: PerformancePreset): void {
    this.currentPreset = preset;
    this.config.targetFPS = preset.targetFPS;
    this.notifyCallbacks();
  }

  /**
   * Force performance evaluation
   */
  evaluatePerformance(): void {
    if (this.frameHistory.length < this.config.sampleSize / 2) return;

    const metrics = this.getMetrics();
    const targetFPS = this.config.targetFPS;
    const minFPS = targetFPS * this.config.fpsThreshold;
    const maxFPS = targetFPS * this.config.upgradeThreshold;

    // Check if we need to downgrade
    if (metrics.averageFPS < minFPS) {
      this.downgradeQuality();
    }
    // Check if we can upgrade (only if we've been stable for a while)
    else if (metrics.averageFPS > maxFPS && this.frameHistory.length >= this.config.sampleSize) {
      this.upgradeQuality();
    }
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    const fps = 1000 / deltaTime;

    // Track dropped frames (assuming 60fps baseline)
    if (deltaTime > 16.67 * 2) { // More than 2 frames worth of time
      this.droppedFrames++;
    }

    // Add to history
    this.frameHistory.push(fps);
    if (this.frameHistory.length > this.config.sampleSize) {
      this.frameHistory.shift();
    }

    this.frameCount++;
    this.lastFrameTime = now;

    // Evaluate performance every 30 frames
    if (this.frameCount % 30 === 0) {
      this.evaluatePerformance();
    }

    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Downgrade quality settings
   */
  private downgradeQuality(): void {
    const presets = Object.values(PERFORMANCE_PRESETS);
    const currentIndex = presets.findIndex(p => p.name === this.currentPreset.name);
    
    if (currentIndex < presets.length - 1) {
      const newPreset = presets[currentIndex + 1];
      console.log(`Performance: Downgrading from ${this.currentPreset.name} to ${newPreset.name}`);
      this.currentPreset = newPreset;
      this.config.targetFPS = newPreset.targetFPS;
      this.notifyCallbacks();
    }
  }

  /**
   * Upgrade quality settings
   */
  private upgradeQuality(): void {
    const presets = Object.values(PERFORMANCE_PRESETS);
    const currentIndex = presets.findIndex(p => p.name === this.currentPreset.name);
    
    if (currentIndex > 0) {
      const newPreset = presets[currentIndex - 1];
      console.log(`Performance: Upgrading from ${this.currentPreset.name} to ${newPreset.name}`);
      this.currentPreset = newPreset;
      this.config.targetFPS = newPreset.targetFPS;
      this.notifyCallbacks();
    }
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return undefined;
  }

  /**
   * Notify all callbacks of performance changes
   */
  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    this.callbacks.forEach(callback => {
      try {
        callback(this.currentPreset, metrics);
      } catch (error) {
        console.error('Error in performance callback:', error);
      }
    });
  }
}

/**
 * Create a performance manager with device-specific configuration
 */
export function createPerformanceManager(
  capabilities: DeviceCapabilities,
  initialPreset: PerformancePreset
): PerformanceManager {
  const config: Partial<PerformanceManagerConfig> = {};

  // Adjust monitoring sensitivity based on device capabilities
  if (capabilities.isMobile) {
    config.fpsThreshold = 0.7; // More aggressive on mobile
    config.sampleSize = 30; // Shorter sample window
  }

  if (capabilities.isLowEnd) {
    config.fpsThreshold = 0.6; // Very aggressive on low-end devices
    config.degradationSteps = 2; // Degrade faster
  }

  return new PerformanceManager(capabilities, initialPreset, config);
}