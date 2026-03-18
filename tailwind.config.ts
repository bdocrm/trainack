import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#160D76', light: '#1E1199', dark: '#0F0A54' },
        brand: { DEFAULT: '#4094d9', light: '#6BB1E5', dark: '#2E78B8' },
        orange: { DEFAULT: '#F08530', light: '#F5A55A', dark: '#D06E1E' },
        primary: '#160D76',
        accent: '#4094d9',
        warning: '#F08530',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-sora)', 'Sora', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(22,13,118,0.06), 0 1px 2px -1px rgba(22,13,118,0.06)',
        'card-hover': '0 10px 15px -3px rgba(22,13,118,0.08), 0 4px 6px -4px rgba(22,13,118,0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
