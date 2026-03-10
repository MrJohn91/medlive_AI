import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Serenity palette
        sage: {
          50: "#f6f7f6",
          100: "#e3e7e3",
          200: "#c7d0c7",
          300: "#a3b2a3",
          400: "#7d917d",
          500: "#627462",
          600: "#4d5c4d",
          700: "#404b40",
          800: "#363e36",
          900: "#2e342e",
          950: "#171b17",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdf9f3",
          200: "#faf3e6",
          300: "#f5e9d4",
          400: "#eddcbd",
          500: "#e2cca3",
          600: "#d4b882",
          700: "#c2a066",
          800: "#a18452",
          900: "#846c45",
        },
        clinical: {
          bg: "#fafbfa",
          card: "#ffffff",
          border: "#e8ebe8",
          muted: "#8a9a8a",
        },
        triage: {
          emergency: "#dc2626",
          urgent: "#ea580c",
          semiurgent: "#d97706",
          routine: "#0284c7",
          selfcare: "#16a34a",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 10px 20px -2px rgba(0, 0, 0, 0.02)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.06)",
        glow: "0 0 40px -10px rgba(98, 116, 98, 0.3)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "breathe": "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
