'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CardProps } from '@/types';

/**
 * Reusable Card component with optional animations
 * Provides consistent styling and hover effects
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  animated = false,
  ...props
}) => {
  // Base card styles
  const baseStyles = 'bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200';
  
  // Hover styles
  const hoverStyles = 'hover:shadow-md hover:border-gray-200';

  if (animated) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(baseStyles, hoverStyles, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(baseStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;