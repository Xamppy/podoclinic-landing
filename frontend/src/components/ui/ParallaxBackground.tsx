'use client';

import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/lib/utils';

interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  disabled?: boolean;
}

export function ParallaxBackground({
  children,
  className,
  speed = 0.5,
  direction = 'up',
  disabled = false,
}: ParallaxBackgroundProps) {
  const { ref, transform } = useParallax({ speed, direction, disabled });

  return (
    <div
      ref={ref}
      className={cn('absolute inset-0 will-change-transform', className)}
      style={{ transform }}
    >
      {children}
    </div>
  );
}

interface FloatingElementProps {
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function FloatingElement({
  className,
  speed = 0.3,
  direction = 'up',
  children,
  style,
}: FloatingElementProps) {
  const { ref, transform } = useParallax({ speed, direction });

  return (
    <div
      ref={ref}
      className={cn('absolute will-change-transform', className)}
      style={{ transform, ...style }}
    >
      {children}
    </div>
  );
}