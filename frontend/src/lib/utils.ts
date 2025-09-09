import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Variants } from "framer-motion";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Animation utility functions
 */
export const animations: Record<string, Variants> = {
  /**
   * Fade in animation variants for Framer Motion
   */
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
  },

  /**
   * Fade in from different directions
   */
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6 }
    },
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6 }
    },
  },

  /**
   * Scale animations
   */
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
  },

  /**
   * Stagger animation for lists
   */
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerFast: {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  staggerSlow: {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  },

  /**
   * Hover animations
   */
  scaleHover: {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
  },

  liftHover: {
    hover: { 
      y: -5,
      transition: { duration: 0.2 }
    },
  },

  /**
   * Continuous animations
   */
  float: {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  },

  rotate: {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity
      }
    }
  },

  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  },
};

/**
 * Intersection Observer hook utility for scroll animations
 */
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Utility to format Chilean phone numbers
 */
export const formatChileanPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  
  // Format as +56 9 XXXX XXXX for mobile numbers
  if (digits.length === 9 && digits.startsWith("9")) {
    return `+56 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
  }
  
  // Format as +56 XX XXX XXXX for landline numbers
  if (digits.length === 9) {
    return `+56 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  
  return phone;
};

/**
 * Utility to validate Chilean phone numbers
 */
export const isValidChileanPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  
  // Chilean mobile numbers: 9 digits starting with 9
  // Chilean landline numbers: 9 digits (area code + number)
  return digits.length === 9 && /^[2-9]/.test(digits);
};

/**
 * Debounce utility function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};