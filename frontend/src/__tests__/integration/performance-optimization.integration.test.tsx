import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LazySection } from '@/components/ui/LazySection';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Performance Optimization Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error boundaries without performance impact', () => {
    const startTime = Date.now();
    
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(100); // Should render quickly
  });

  it('should implement lazy loading correctly', () => {
    render(
      <LazySection>
        <div>Lazy content</div>
      </LazySection>
    );
    
    // Should not show lazy content initially
    expect(screen.queryByText('Lazy content')).not.toBeInTheDocument();
    
    // Should set up intersection observer
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('should handle image optimization gracefully', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );
    
    // Should render without errors
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('should combine multiple performance optimizations', () => {
    const startTime = Date.now();
    
    render(
      <ErrorBoundary>
        <LazySection>
          <OptimizedImage
            src="/test-image.jpg"
            alt="Test image"
            width={100}
            height={100}
          />
        </LazySection>
      </ErrorBoundary>
    );
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // Should render efficiently even with multiple optimizations
    expect(renderTime).toBeLessThan(150);
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('should handle error states in optimized components', () => {
    // Suppress console.error for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Should show error boundary fallback
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    
    jest.restoreAllMocks();
  });
});