import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#1B5E72",
          "teal-dark": "#164d5e",
          "teal-light": "#2a7a92",
          blue: "#7DD8E8",
          "blue-light": "#a8e6f0",
          vivid: "#1BAFE8",
          "vivid-dark": "#1597cc",
          bg: "#F3F3F3",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        input: "8px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.10)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.15)",
      },
      letterSpacing: {
        heading: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
