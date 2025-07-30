import type { Config } from "tailwindcss";

// We want each package to be responsible for its own content based on its framework.
export default {
  content: [""],
  theme: {
    extend: {
      backgroundImage: {
        "glow-cons": [
          "conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
          "none",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
