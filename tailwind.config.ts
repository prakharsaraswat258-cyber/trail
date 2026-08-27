import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F3",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F3F1EB",
          raised: "#ECEAE2",
        },
        border: {
          DEFAULT: "rgba(0, 0, 0, 0.07)",
          subtle: "rgba(0, 0, 0, 0.07)",
          strong: "rgba(0, 0, 0, 0.14)",
        },
        text: {
          primary: "#1C1B18",
          secondary: "#6E6B5F",
          muted: "#A8A49A",
        },
        "text-primary": "#1C1B18",
        "text-secondary": "#6E6B5F",
        "text-muted": "#A8A49A",
        accent: {
          DEFAULT: "#C96442",
          hover: "#B5572E",
          light: "#F2E8E2",
        },
        success: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Geist Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        focus: "0 0 0 3px rgba(201, 100, 66, 0.15)",
        "focus-error": "0 0 0 3px rgba(220, 38, 38, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
