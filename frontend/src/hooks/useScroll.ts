'use client';

import { useEffect, useState, useCallback } from 'react';

interface ScrollData {
  scrollY: number;
  scrollVelocity: number;
  direction: 'up' | 'down' | 'none';
  isScrolling: boolean;
}

/**
 * Hook for tracking scroll position and velocity
 * Optimized for performance with throttling and cleanup
 */
export function useScroll(): ScrollData {
  const [scrollData, setScrollData] = useState<ScrollData>({
    scrollY: 0,
    scrollVelocity: 0,
    direction: 'none',
    isScrolling: false,
  });

  const [lastScrollY, setLastScrollY] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const currentTimestamp = Date.now();
    
    // Calculate velocity (pixels per millisecond)
    const timeDiff = currentTimestamp - lastTimestamp;
    const scrollDiff = currentScrollY - lastScrollY;
    const velocity = timeDiff > 0 ? Math.abs(scrollDiff) / timeDiff : 0;
    
    // Determine direction
    let direction: 'up' | 'down' | 'none' = 'none';
    if (scrollDiff > 0) direction = 'down';
    else if (scrollDiff < 0) direction = 'up';

    setScrollData({
      scrollY: currentScrollY,
      scrollVelocity: velocity,
      direction,
      isScrolling: true,
    });

    setLastScrollY(currentScrollY);
    setLastTimestamp(currentTimestamp);

    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Set scrolling to false after scroll stops
    const timeout = setTimeout(() => {
      setScrollData(prev => ({
        ...prev,
        isScrolling: false,
        scrollVelocity: 0,
      }));
    }, 150);

    setScrollTimeout(timeout);
  }, [lastScrollY, lastTimestamp, scrollTimeout]);

  useEffect(() => {
    // Initialize values
    setLastScrollY(window.scrollY);
    setLastTimestamp(Date.now());
    
    // Throttled scroll handler for performance
    let ticking = false;
    
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [handleScroll, scrollTimeout]);

  return scrollData;
}