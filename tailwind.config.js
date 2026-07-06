/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 30% 98%)",
        foreground: "hsl(220 25% 18%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(220 25% 18%)",
        primary: {
          DEFAULT: "hsl(199 89% 58%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(270 50% 92%)",
          foreground: "hsl(270 40% 35%)",
        },
        muted: {
          DEFAULT: "hsl(210 20% 94%)",
          foreground: "hsl(220 10% 50%)",
        },
        accent: {
          DEFAULT: "hsl(340 75% 65%)",
          foreground: "hsl(0 0% 100%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        border: "hsl(210 20% 90%)",
        input: "hsl(210 20% 90%)",
        ring: "hsl(199 89% 58%)",
        droppi: {
          sky: "hsl(199 89% 58%)",
          "sky-light": "hsl(199 89% 92%)",
          lavender: "hsl(270 50% 75%)",
          "lavender-light": "hsl(270 50% 94%)",
          peach: "hsl(20 90% 72%)",
          "peach-light": "hsl(20 90% 94%)",
          mint: "hsl(160 50% 60%)",
          "mint-light": "hsl(160 50% 93%)",
          rose: "hsl(340 75% 65%)",
          warm: "hsl(35 90% 60%)",
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
