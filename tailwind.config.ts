import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,,mdx}"],
  theme: {
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.75rem" }],
      lg: ["1.125rem", { lineHeight: "2rem" }],
      xl: ["1.25rem", { lineHeight: "2rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["2rem", { lineHeight: "2.5rem" }],
      "4xl": ["2.5rem", { lineHeight: "3.5rem" }],
      "5xl": ["3rem", { lineHeight: "3.5rem" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1.1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    extend: {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.75rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "2rem" }],
        "2xl": ["1.5rem", { lineHeight: "2.25rem" }],
        "3xl": ["1.75rem", { lineHeight: "2.25rem" }],
        "4xl": ["2rem", { lineHeight: "2.5rem" }],
        "5xl": ["2.5rem", { lineHeight: "3rem" }],
        "6xl": ["3rem", { lineHeight: "3.5rem" }],
        "7xl": ["4rem", { lineHeight: "4.5rem" }],
      },
      animation: {
        "spin-fast-1": "shuffle 0.1s linear 3",
        "spin-fast-2": "shuffle 0.2s linear 4",
        "spin-fast-3": "shuffle 0.3s linear 5",
      },
      keyframes: {
        shuffle: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(180deg)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        // sans: ["Inter", ...defaultTheme.fontFamily.sans],
        // display: ["Lexend", ...defaultTheme.fontFamily.sans],
        sans: ["Mona Sans", ...defaultTheme.fontFamily.sans],
        display: [
          ["Mona Sans", ...defaultTheme.fontFamily.sans],
          { fontVariationSettings: '"wdth" 125' },
        ],
      },
      maxWidth: {
        "2xl": "40rem",
      },
      minWidth: {
        "1/2": "50%",
      },
      aspectRatio: {
        card: "320 / 447",
        "card-image-only": "320 / 263",
        "card-image-name": "375 / 392",
      },
      colors: {
        ruby: "#C74241",
        sapphire: "#088BBC",
        amethyst: "#7D3D7B",
        emerald: "#2B9043",
        amber: "#F0A82D",
        steel: "#8D97A0",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("./tailwind/scrollBarHide"),
  ],
} satisfies Config;
