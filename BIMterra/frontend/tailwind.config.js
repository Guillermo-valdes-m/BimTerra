/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "plano técnico": azul de plano (blueprint) + amarillo de obra
        blueprint: {
          950: "#081C2B",
          900: "#0C2E44",
          800: "#123F5C", // fondo principal
          700: "#1A5074",
          600: "#26648C",
          500: "#3D7DA6",
          400: "#6FA3C4",
          300: "#A8CBE0",
          100: "#E4F0F7",
        },
        obra: {
          DEFAULT: "#F2A93B", // amarillo de casco/obra — acento
          600: "#D68F22",
          400: "#F6C36B",
        },
        papel: "#F6F4EE", // "papel" de plano para paneles claros
        tinta: "#12202B", // texto principal sobre fondos claros
        estado: {
          ok: "#2E8B57",
          atraso: "#C1443D",
          alerta: "#D68F22",
        },
      },
      fontFamily: {
        display: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // Grilla sutil tipo papel milimetrado de plano técnico
        grilla: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grilla: "24px 24px",
      },
    },
  },
  plugins: [],
};
