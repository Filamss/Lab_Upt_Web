/**
 * Tailwind CSS configuration for the UPT Laboratorium dashboard.
 *
 * Includes custom colors, typography, and animations.
 */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D47A1',
        surfaceDark: '#1F2937',
        mutedDark: '#111827',
        borderDark: '#374151',
        surface: '#FFFFFF',
        muted: '#F3F4F6',
        border: '#E5E7EB',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
        primaryLight: '#0284C7',
        primaryDark: '#075985',
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out',
        fadeOut: 'fadeOut 0.4s ease-in',
      },
    },
  },
  plugins: [],
};
