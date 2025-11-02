/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Allow CSS variable overrides
        primary: 'var(--idm-color-primary, #3B82F6)',
        error: 'var(--idm-color-error, #EF4444)',
        success: 'var(--idm-color-success, #10B981)',
        warning: 'var(--idm-color-warning, #F59E0B)',
      },
      borderRadius: {
        idm: 'var(--idm-radius, 0.5rem)',
      },
      spacing: {
        idm: 'var(--idm-spacing, 1rem)',
      },
    },
  },
  plugins: [],
};
