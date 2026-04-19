import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// GitHub Pages project site: https://<user>.github.io/gonggudao/
const repoName = "gonggudao";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? (mode === "production" ? `/${repoName}/` : "/"),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
