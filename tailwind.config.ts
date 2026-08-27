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
          strong: "rgba(0, 0, 0, 0.14)",
        },
        text: {
          primary: "#1C1B18",
          secondary: "#6E6B5F",
          muted: "#A8A49A",
        },
        accent: {
          DEFAULT: "#C96442",
          hover: "#B5572E",
          light: "#F2E8E2",
        },
        success: "#059669",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
