'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { InputProps } from '@/types';

/**
 * Reusable Input component with validation states and accessibility features
 * Supports text, email, and tel input types with proper validation
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  error,
  placeholder,
  className,
  ...props
}, ref) => {
  // Generate unique IDs for accessibility
  const inputId = `input-${name}`;
  const errorId = `error-${name}`;
  const labelId = `label-${name}`;

  // Base input styles with touch-friendly design
  const baseInputStyles = 'w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-target';
  
  // State-dependent styles
  const stateStyles = {
    default: 'border-gray-300 focus:border-[#55A05E] focus:ring-[#55A05E]',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  };

  // Label styles
  const labelStyles = 'block text-sm font-medium text-[#2C6145] mb-2';
  
  // Required indicator styles
  const requiredStyles = 'text-red-500 ml-1';

  // Error message styles
  const errorStyles = 'text-red-600 text-sm mt-1 flex items-center';

  // Determine current state
  const currentState = error ? 'error' : 'default';

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Animation variants for error message
  const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto' },
    exit: { opacity: 0, y: -10, height: 0 },
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      <label
        id={labelId}
        htmlFor={inputId}
        className={labelStyles}
      >
        {label}
        {required && (
          <span className={requiredStyles} aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input Field */}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          baseInputStyles,
          stateStyles[currentState]
        )}
        {...props}
      />

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={errorStyles}
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;