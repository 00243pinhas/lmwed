import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    // Deliberately NOT extending — the design system is a closed palette.
    // Only the tokens defined in CLAUDE.md are available. No Tailwind defaults.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      dark: '#0C0A08',      // hero backgrounds, dark sections
      light: '#F8F4EF',     // primary page background
      surface: '#F0EBE3',   // alternate light sections
      ink: '#1A1612',       // primary text on light
      muted: '#7A7068',     // secondary text, labels
      accent: '#C4B8AC',    // subtle accent, numbers — use sparingly
      'border-d': '#2A2420', // borders on dark backgrounds
      'border-l': '#DDD8D0', // borders on light backgrounds
      white: '#FFFFFF',     // text on dark backgrounds
      // Dashboard-only status colors — see skills/dashboard-design.md.
      // Never used on the marketing site.
      ok: '#2E6E44',
      'ok-bg': '#E4F2EA',
      warn: '#B8860B',
      'warn-bg': '#F5EFE0',
      alert: '#A03028',
      'alert-bg': '#F5E8E4',
    },
    borderRadius: {
      none: '0',
      // Dashboard-only small radius — marketing site stays sharp (0px).
      sm: '6px',
    },
    boxShadow: {
      none: 'none',
      // Dashboard-only subtle lift for cards/tables — marketing site stays flat.
      card: '0 1px 3px 0 rgba(12, 10, 8, 0.08)',
    },
    fontFamily: {
      display: ['var(--font-cormorant)', 'serif'],
      body: ['var(--font-jost)', 'sans-serif'],
    },
    fontSize: {
      // Display scale (Cormorant Garamond)
      'display-xl': ['100px', { lineHeight: '1', letterSpacing: '0.02em' }],
      'display-lg': ['64px', { lineHeight: '1.05', letterSpacing: '0.02em' }],
      'display-md': ['48px', { lineHeight: '1.1', letterSpacing: '0.02em' }],
      'display-sm': ['36px', { lineHeight: '1.15' }],
      'display-xs': ['28px', { lineHeight: '1.2' }],
      'display-2xs': ['22px', { lineHeight: '1.3' }],
      // Body / UI (Jost)
      body: ['14px', { lineHeight: '1.8' }],
      label: ['10px', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      nav: ['11px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
    },
    extend: {
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        '2xl': '64px',
        '3xl': '80px',
        '4xl': '120px',
        section: '160px',
        'section-mobile': '80px',
      },
      borderWidth: {
        hairline: '0.5px',
      },
      transitionTimingFunction: {
        // Standard easing — use everywhere
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        reveal: '700ms',
        ui: '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
