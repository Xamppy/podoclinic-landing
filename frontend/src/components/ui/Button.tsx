'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/types';

/**
 * Reusable Button component with multiple variants and accessibility features
 * Supports primary, secondary, and outline variants with hover animations
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props
}) => {
  // Base button styles with touch-friendly design
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target select-none';

  // Variant styles
  const variantStyles = {
    primary: 'bg-[#55A05E] text-white hover:bg-[#4a8f52] focus:ring-[#55A05E] shadow-sm hover:shadow-md active:bg-[#3d7a44]',
    secondary: 'bg-white text-[#2C6145] border-2 border-[#2C6145] hover:bg-[#2C6145] hover:text-white focus:ring-[#2C6145] active:bg-[#1e4230]',
    outline: 'bg-transparent text-[#2C6145] border border-[#2C6145] hover:bg-[#2C6145] hover:text-white focus:ring-[#2C6145] active:bg-[#1e4230]',
  };

  // Size styles with responsive and touch-friendly dimensions
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px] sm:min-h-[52px]',
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Handle click with loading state
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      // Enhanced accessibility
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </motion.button>
  );
};

export default Button;