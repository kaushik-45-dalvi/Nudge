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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        border: "var(--border)",
        primary: {
          DEFAULT: "#6366F1",
          dark: "#4F46E5",
          light: "#EEF2FF"
        },
        retro: {
          yellow: '#FFD000',
          orange: '#F97316',
          red: '#E8321A',
          darkred: '#8B0000',
          black: '#0A0A0A',
          white: '#FFFFFF',
          slate: '#F8F8F6'
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
