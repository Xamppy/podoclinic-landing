import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Podoclinic brand colors from design-01.json
        primary: {
          DEFAULT: "#2C6145", // Principal - Confianza, fondos, títulos
        },
        accent: {
          DEFAULT: "#55A05E", // Acento - Botones de CTA, elementos interactivos
        },
        background: {
          DEFAULT: "#FFFFFF", // Fondo primario
          secondary: "#F8F9FA", // Fondo secundario
        },
        text: {
          primary: "#212529", // Texto primario
          secondary: "#495057", // Texto secundario
        },
        // Keep Next.js defaults for compatibility
        foreground: "var(--foreground)",
      },
      fontFamily: {
        // Typography from design-01.json with CSS variables
        montserrat: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        lato: ["var(--font-lato)", "Lato", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        sans: ["var(--font-poppins)", "Poppins", "Lato", "Montserrat", "sans-serif"],
      },
      fontSize: {
        // Typography sizes from design-01.json with responsive clamp functions
        "title": ["clamp(2rem, 4vw, 2.5rem)", { lineHeight: "1.2", fontWeight: "700" }],
        "subtitle": ["clamp(1.125rem, 2.5vw, 1.25rem)", { lineHeight: "1.4", fontWeight: "400" }],
        "body": ["clamp(0.875rem, 2vw, 1rem)", { lineHeight: "1.6", fontWeight: "400" }],
        // Additional responsive text sizes
        "hero-title": ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1.1", fontWeight: "700" }],
        "hero-subtitle": ["clamp(1.25rem, 3vw, 1.5rem)", { lineHeight: "1.4", fontWeight: "400" }],
        "section-title": ["clamp(1.875rem, 4vw, 2.25rem)", { lineHeight: "1.2", fontWeight: "600" }],
        "card-title": ["clamp(1.125rem, 2.5vw, 1.25rem)", { lineHeight: "1.3", fontWeight: "600" }],
      },
      borderRadius: {
        // Component border radius from design-01.json
        "button": "8px",
        "card": "12px",
      },
      spacing: {
        // Spacing from design-01.json with responsive values
        "section": "clamp(3rem, 8vw, 4rem)",
        "container": "clamp(1rem, 4vw, 1.5rem)",
        "gap": "clamp(1.5rem, 4vw, 2rem)",
        // Touch-friendly spacing
        "touch-target": "44px", // Minimum touch target size
        "touch-spacing": "8px", // Minimum spacing between touch targets
      },
      boxShadow: {
        // Card shadow from design-01.json
        "card": "0 4px 12px rgba(0,0,0,0.05)",
      },
      animation: {
        // Custom animations for hover effects
        "scale-hover": "scale 0.2s ease-in-out",
      },
      keyframes: {
        scale: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
