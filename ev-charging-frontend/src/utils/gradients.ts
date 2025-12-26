/**
 * Professional Purple Gradient Utilities
 * Consistent gradient styles for the EV Charging Station application
 */

// Base gradient colors matching login page
export const GRADIENT_COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  primaryDark: "#5a6fd8",
  secondaryDark: "#6a4190",
} as const;

// Main gradient styles - use purple selectively
export const GRADIENTS = {
  // Primary gradient used in login and primary buttons only
  primary: `linear-gradient(135deg, ${GRADIENT_COLORS.primary} 0%, ${GRADIENT_COLORS.secondary} 100%)`,

  // Darker variant for hover states
  primaryDark: `linear-gradient(135deg, ${GRADIENT_COLORS.primaryDark} 0%, ${GRADIENT_COLORS.secondaryDark} 100%)`,

  // Clean neutral backgrounds
  background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",

  // Clean card background - no purple tint
  cardBackground: "#ffffff",

  // Clean white header/AppBar
  header: "#ffffff",

  // Status gradients
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",

  // Subtle accent - very light for backgrounds
  accent: "rgba(102, 126, 234, 0.02)",

  // Text gradient for special headings only
  text: `linear-gradient(135deg, ${GRADIENT_COLORS.primary} 0%, ${GRADIENT_COLORS.secondary} 100%)`,
} as const;

// Box shadow utilities with neutral colors
export const SHADOWS = {
  primary: "0 2px 8px rgba(0, 0, 0, 0.1)",
  primaryHover: "0 4px 12px rgba(0, 0, 0, 0.15)",
  card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
  cardHover: "0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
  subtle: "0 1px 2px rgba(0, 0, 0, 0.05)",
} as const;

// Utility functions for dynamic gradients
export const createGradient = (
  color1: string,
  color2: string,
  direction = "135deg"
) => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

export const createRadialGradient = (color1: string, color2: string) => {
  return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
};

// Common style objects for MUI sx prop - balanced usage
export const GRADIENT_STYLES = {
  primaryButton: {
    background: GRADIENTS.primary,
    boxShadow: SHADOWS.primary,
    "&:hover": {
      background: GRADIENTS.primaryDark,
      boxShadow: SHADOWS.primaryHover,
      transform: "translateY(-1px)",
    },
  },

  cleanCard: {
    background: GRADIENTS.cardBackground,
    boxShadow: SHADOWS.card,
    border: "1px solid #e2e8f0",
    "&:hover": {
      boxShadow: SHADOWS.cardHover,
      transform: "translateY(-1px)",
    },
  },

  headerBackground: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    borderBottom: "1px solid #e2e8f0",
  },

  accentBackground: {
    background: GRADIENTS.accent,
  },

  gradientText: {
    background: GRADIENTS.text,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "bold",
  },
} as const;

// CSS custom properties for consistent usage
export const CSS_VARIABLES = {
  "--gradient-primary": GRADIENTS.primary,
  "--gradient-primary-dark": GRADIENTS.primaryDark,
  "--gradient-background": GRADIENTS.background,
  "--gradient-text": GRADIENTS.text,
  "--shadow-primary": SHADOWS.primary,
  "--shadow-card": SHADOWS.card,
} as const;
