module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          200: 'var(--color-dark-200)',
          300: 'var(--color-dark-300)',
          500: 'var(--color-dark-500)',
          900: 'var(--color-dark-900)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
