import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rebu: {
          green: "#1e40af",
          "green-light": "#3b82f6",
          "green-dark": "#1e3a5f",
          cream: "#f0f4f8",
          stone: "#dce4ed",
          charcoal: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-up": "fadeUp 0.7s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(30, 58, 95, 0.15)",
        glow: "0 0 0 1px rgba(30, 64, 175, 0.1), 0 20px 60px -15px rgba(30, 64, 175, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
