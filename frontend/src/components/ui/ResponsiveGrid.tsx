'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive, type Breakpoint } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: Partial<Record<Breakpoint, number>>;
  gap?: string;
  className?: string;
}

/**
 * Responsive grid component that adapts columns based on screen size
 */
export function ResponsiveGrid({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-6',
  className 
}: ResponsiveGridProps) {
  const { currentBreakpoint } = useResponsive();
  
  // Get the appropriate number of columns for current breakpoint
  const getColumns = () => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i];
      if (columns[breakpoint] !== undefined) {
        return columns[breakpoint];
      }
    }
    
    return 1; // Default fallback
  };

  const columnCount = getColumns();
  
  // Generate grid template columns style
  const gridStyle = {
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
  };

  return (
    <div 
      className={cn('grid', gap, className)}
      style={gridStyle}
    >
      {children}
    </div>
  );
}

/**
 * Auto-fit responsive grid that automatically adjusts based on content width
 */
export function AutoFitGrid({ 
  children, 
  minItemWidth = '250px',
  gap = 'gap-6',
  className 
}: {
  children: React.ReactNode;
  minItemWidth?: string;
  gap?: string;
  className?: string;
}) {
  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
  };

  return (
    <div 
      className={cn('grid', gap, className)}
      style={gridStyle}
    >
      {children}
    </div>
  );
}

export default ResponsiveGrid;