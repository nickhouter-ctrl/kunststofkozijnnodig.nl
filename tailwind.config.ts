import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Editorial neutrals — the base of the aesthetic (à la Habitat One)
        ink: "#141917",
        "ink-soft": "#565c58",
        paper: "#ffffff",
        sand: "#efece4",
        // Rebu-green brand accent + legacy token names (kept so existing
        // markup keeps working — they now resolve to the green editorial set).
        rebu: {
          green: "#00a66e",
          "green-light": "#2bbd8a",
          "green-dark": "#0b3d2e",
          tint: "#e8f6f0",
          cream: "#f7f5f0",
          stone: "#e4e0d6",
          charcoal: "#141917",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: {
        editorial: "0.28em",
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
        soft: "0 24px 60px -30px rgba(20, 25, 23, 0.28)",
        glow: "0 30px 70px -25px rgba(0, 166, 110, 0.30)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
