module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          secondary: 'var(--color-dark-secondary)',
          primary: 'var(--color-dark-primary)',
          gray: '#72808e',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
