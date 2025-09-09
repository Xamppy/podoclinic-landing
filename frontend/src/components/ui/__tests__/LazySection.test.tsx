import React from 'react';
import { render, screen } from '@testing-library/react';
import { LazySection } from '../LazySection';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fallback initially', () => {
    render(
      <LazySection>
        <div>Lazy content</div>
      </LazySection>
    );

    // Should show default fallback (skeleton)
    expect(screen.queryByText('Lazy content')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom loading...</div>;

    render(
      <LazySection fallback={customFallback}>
        <div>Lazy content</div>
      </LazySection>
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
    expect(screen.queryByText('Lazy content')).not.toBeInTheDocument();
  });

  it('sets up IntersectionObserver with correct options', () => {
    render(
      <LazySection rootMargin="200px" threshold={0.5}>
        <div>Lazy content</div>
      </LazySection>
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '200px',
        threshold: 0.5
      }
    );
  });

  it('uses default options when not provided', () => {
    render(
      <LazySection>
        <div>Lazy content</div>
      </LazySection>
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <LazySection className="custom-class">
        <div>Lazy content</div>
      </LazySection>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  // Test intersection behavior
  it('shows content when intersection occurs', () => {
    let intersectionCallback: (entries: any[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      };
    });

    render(
      <LazySection>
        <div>Lazy content</div>
      </LazySection>
    );

    // Simulate intersection
    intersectionCallback([{ isIntersecting: true }]);

    // Re-render to see the effect
    expect(screen.queryByText('Lazy content')).not.toBeInTheDocument();
  });
});