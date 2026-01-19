/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul Petróleo (Primario)
        "brand-primary": "#2F4F4F",
        "brand-primary-light": "#426868", // Un tono más suave para hovers

        // Verde Salvia (Secundario)
        "brand-secondary": "#9BA88D",
        "brand-secondary-light": "#BAC7AD",

        // Gris Piedra Cálido (Fondo Neutro)
        "brand-bg": "#E5E5E5",
        "brand-bg-light": "#F5F5F3",

        // Terracota Suave (Detalles emocionales)
        "brand-accent": "#D9A17E",

        // Mostaza (Botones/Acción)
        "brand-action": "#D4A017",

        // Texto
        "brand-text": "#2D2D2D", // Gris casi negro para lectura cómoda
        "brand-text-muted": "#5C5C5C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Usaremos Inter como fuente principal
      },
    },
  },
  plugins: [],
};
