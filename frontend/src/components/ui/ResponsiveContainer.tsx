'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

/**
 * Responsive container component with adaptive padding and max-width
 */
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = true
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  };

  const paddingClass = padding ? (
    isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'
  ) : '';

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClass,
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Section wrapper with responsive spacing
 */
export function ResponsiveSection({ 
  children, 
  className,
  spacing = 'normal'
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}) {
  const { isMobile } = useResponsive();

  const spacingClasses = {
    tight: isMobile ? 'py-8' : 'py-12',
    normal: isMobile ? 'py-12' : 'py-20',
    loose: isMobile ? 'py-16' : 'py-32',
  };

  return (
    <section className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </section>
  );
}

export default ResponsiveContainer;