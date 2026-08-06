import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      // De site stond op de browserstandaard van 16px, waardoor lopende tekst
      // (veel text-sm) op 14px uitkwam — aan de kleine kant voor een zakelijke
      // site. Onderstaande schaal tilt vooral de leesmaten op; koppen groeien
      // nauwelijks, want die waren al fors. De line-heights staan er expliciet
      // bij omdat Tailwind die anders laat vallen zodra je een maat overschrijft.
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.15rem" }], // 13px (was 12)
        sm: ["0.9375rem", { lineHeight: "1.45rem" }], // 15px (was 14)
        base: ["1.0625rem", { lineHeight: "1.7rem" }], // 17px (was 16)
        lg: ["1.1875rem", { lineHeight: "1.8rem" }], // 19px (was 18)
        xl: ["1.3125rem", { lineHeight: "1.9rem" }], // 21px (was 20)
        "2xl": ["1.5625rem", { lineHeight: "2.1rem" }], // 25px (was 24)
      },
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
        "pop-in": "popIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite",
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
        // WhatsApp-knop: springt er even in en vraagt daarna rustig aandacht.
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.4) translateY(20px)" },
          "70%": { opacity: "1", transform: "scale(1.12) translateY(0)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "70%": { transform: "scale(1.9)", opacity: "0" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
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
