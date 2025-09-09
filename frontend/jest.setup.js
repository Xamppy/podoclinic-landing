import '@testing-library/jest-dom'

// Mock framer-motion to avoid issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, variants, initial, animate, exit, transition, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, variants, initial, animate, exit, transition, ...props }) => <button {...props}>{children}</button>,
    input: ({ children, whileHover, whileTap, variants, initial, animate, exit, transition, ...props }) => <input {...props}>{children}</input>,
  },
  AnimatePresence: ({ children, mode }) => children,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}