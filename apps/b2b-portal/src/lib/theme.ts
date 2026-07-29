/**
 * B2B Portal — Semantic Design Tokens in JS config.
 * Mirrors the CSS properties defined in globals.css.
 */
export const B2B_THEME = {
  colors: {
    brand: {
      primary: '#fcaf16',
      primaryHover: '#e59a0f',
      primaryLight: 'rgba(252, 175, 22, 0.1)',
    },
    background: '#09090b',
    surface: '#101012',
    surfaceHover: '#1b1b1f',
    card: '#141417',
    cardHover: '#1f1f24',
    border: '#242427',
    divider: '#1d1d20',
    
    text: {
      primary: '#f4f4f5',
      secondary: '#a1a1aa',
      muted: '#52525b',
    },

    status: {
      success: {
        text: '#10b981',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.2)',
      },
      warning: {
        text: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.2)',
      },
      error: {
        text: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.2)',
      },
      info: {
        text: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.08)',
        border: 'rgba(59, 130, 246, 0.2)',
      },
    },
  },
  radii: {
    sm: 'rounded-sm',     // 6px
    md: 'rounded-md',     // 10px
    lg: 'rounded-lg',     // 16px
    xl: 'rounded-xl',     // 24px
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    glow: 'shadow-glow',
  },
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
  },
} as const;

export default B2B_THEME;
