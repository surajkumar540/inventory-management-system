/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        surface: {
          DEFAULT: "#ffffff",
          page:    "#f8fafc",
          muted:   "#f1f5f9",
        },
        border: {
          DEFAULT: "#e2e8f0",
          muted:   "#f1f5f9",
        },
        ink: {
          DEFAULT: "#1e293b",
          muted:   "#64748b",
          faint:   "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs:    ["11px", { lineHeight: "16px" }],
        sm:    ["12px", { lineHeight: "18px" }],
        base:  ["13px", { lineHeight: "20px" }],
        md:    ["14px", { lineHeight: "22px" }],
        lg:    ["16px", { lineHeight: "24px" }],
        xl:    ["18px", { lineHeight: "28px" }],
        "2xl": ["20px", { lineHeight: "30px" }],
        "3xl": ["22px", { lineHeight: "32px" }],
      },
      borderRadius: {
        sm:    "6px",
        md:    "8px",
        lg:    "12px",
        xl:    "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        modal: "0 4px 24px rgba(0,0,0,0.10)",
        sm:    "0 1px 2px rgba(0,0,0,0.05)",
      },
      spacing: {
        sidebar: "220px",
        navbar:  "56px",
      },
      backgroundImage: {
        "brand-gradient":   "linear-gradient(135deg, #6366f1, #818cf8)",
        "success-gradient": "linear-gradient(135deg, #22c55e, #4ade80)",
        "warning-gradient": "linear-gradient(135deg, #f59e0b, #fbbf24)",
        "danger-gradient":  "linear-gradient(135deg, #ef4444, #f87171)",
      },
    },
  },
  plugins: [],
};