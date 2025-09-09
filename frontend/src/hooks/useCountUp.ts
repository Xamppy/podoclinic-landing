import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  separator?: string;
  delay?: number;
}

interface UseCountUpReturn {
  value: string;
  reset: () => void;
  start: () => void;
}

export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  separator = '',
  delay = 0,
}: UseCountUpOptions): UseCountUpReturn {
  const [currentValue, setCurrentValue] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const formatNumber = (num: number): string => {
    let formattedNum = decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
    
    if (separator && formattedNum.length > 3) {
      formattedNum = formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    
    return `${prefix}${formattedNum}${suffix}`;
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (easeOutCubic)
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(progress);

    const currentNum = start + (end - start) * easedProgress;
    setCurrentValue(currentNum);

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      setCurrentValue(end);
    }
  };

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    startTimeRef.current = undefined;
    
    const startWithDelay = () => {
      frameRef.current = requestAnimationFrame(animate);
    };

    if (delay > 0) {
      setTimeout(startWithDelay, delay);
    } else {
      startWithDelay();
    }
  };

  const resetAnimation = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setCurrentValue(start);
    setIsAnimating(false);
    startTimeRef.current = undefined;
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    value: formatNumber(currentValue),
    reset: resetAnimation,
    start: startAnimation,
  };
}