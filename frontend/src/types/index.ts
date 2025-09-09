// Contact form data types
export interface ContactFormData {
  fullName: string;
  email: string;
  whatsapp: string;
}

// Pricing plan data types
export interface PricingPlan {
  id: string;
  name: string;
  price: number | 'free';
  popular?: boolean;
  features: string[];
  userLimit: number | 'unlimited';
  patientLimit: number | 'unlimited';
}

// Benefit data types
export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Feature data types
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'tel';
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

// Animation types
export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: {
      duration?: number;
      ease?: string;
      delay?: number;
      staggerChildren?: number;
    };
  };
}

// Section component props
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

// 3D Model props
export interface FootModelProps {
  className?: string;
  animated?: boolean;
}

// Form validation error types
export interface FormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Theme and design system types
export type ColorVariant = 'primary' | 'accent' | 'background' | 'text';
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';
export type SpacingVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'section' | 'container';

// Responsive breakpoint types
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

// Animation timing types
export type AnimationTiming = 'fast' | 'normal' | 'slow';
export type EasingFunction = 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';

// Footer component types
export interface FooterProps {
  className?: string;
}

export interface LegalLink {
  href: string;
  label: string;
}

export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
}