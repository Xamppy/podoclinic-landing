/**
 * Design System Constants
 * Based on design-01.json specifications
 */

// Color Palette
export const colors = {
  primary: {
    main: '#2C6145', // Confianza, fondos, títulos
    accent: '#55A05E', // Botones de CTA, elementos interactivos
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
  },
  text: {
    primary: '#212529',
    secondary: '#495057',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    main: 'Montserrat, Lato, Poppins, sans-serif',
    titles: 'Montserrat',
    subtitles: 'Lato', 
    body: 'Poppins',
  },
  fontSize: {
    title: '2.5rem',
    subtitle: '1.25rem',
    body: '1rem',
  },
  fontWeight: {
    title: '700',
    subtitle: '400',
    body: '400',
  },
} as const;

// Component Specifications
export const components = {
  button: {
    primary: {
      background: colors.primary.accent,
      color: colors.background.primary,
      borderRadius: '8px',
      padding: '12px 24px',
      shadow: 'none',
      hoverTransform: 'scale(1.05)',
    },
  },
  card: {
    background: colors.background.primary,
    borderRadius: '12px',
    shadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '24px',
  },
} as const;

// Spacing System
export const spacing = {
  section: {
    margin: '64px 0',
  },
  container: {
    padding: '0 24px',
  },
  gap: {
    elements: '32px',
  },
} as const;

// Animation Specifications
export const animations = {
  hover: {
    type: 'scale',
    transform: 'scale(1.05)',
    transition: 'transform 0.2s ease-in-out',
  },
  scroll: {
    type: 'fade-in',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  parallax: {
    type: 'background-movement',
    speed: 0.5,
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1440px',
} as const;