import { useEffect, useRef, useState } from 'react';

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  disabled?: boolean;
}

interface UseParallaxReturn {
  ref: React.RefObject<HTMLDivElement>;
  transform: string;
}

/**
 * Hook for creating parallax effects on scroll
 * Optimized for performance using transform and requestAnimationFrame
 */
export function useParallax({
  speed = 0.5,
  direction = 'up',
  disabled = false,
}: UseParallaxOptions = {}): UseParallaxReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate3d(0, 0, 0)');
  const frameRef = useRef<number>();

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const updateTransform = () => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate if element is in viewport
      const isInViewport = elementTop < windowHeight && elementTop + elementHeight > 0;

      if (isInViewport) {
        // Calculate scroll progress relative to element position
        const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        const movement = scrollProgress * speed * 100;

        let transformValue = '';
        switch (direction) {
          case 'up':
            transformValue = `translate3d(0, ${-movement}px, 0)`;
            break;
          case 'down':
            transformValue = `translate3d(0, ${movement}px, 0)`;
            break;
          case 'left':
            transformValue = `translate3d(${-movement}px, 0, 0)`;
            break;
          case 'right':
            transformValue = `translate3d(${movement}px, 0, 0)`;
            break;
        }

        setTransform(transformValue);
      }
    };

    const handleScroll = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(updateTransform);
    };

    // Initial calculation
    updateTransform();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [speed, direction, disabled]);

  return { ref, transform };
}

/**
 * Hook for multiple parallax elements with different speeds
 * Note: This hook should be used with a fixed number of elements
 */
export function useMultiParallax(elements: Array<{ speed: number; direction?: 'up' | 'down' | 'left' | 'right' }>) {
  // Create individual hooks for each element (must be called in the same order each time)
  const results = [];
  for (let i = 0; i < elements.length; i++) {
    const { speed, direction } = elements[i];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results.push(useParallax({ speed, direction }));
  }
  return results;
}