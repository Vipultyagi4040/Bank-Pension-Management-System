import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron";
  
  return {
    plugins: [react()],
    base: isElectron ? "./" : "/",
    server: {
      port: 5173,
      host: true
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            charts: ["recharts"],
            icons: ["lucide-react"],
            motion: ["framer-motion"],
            router: ["react-router-dom"],
            query: ["@tanstack/react-query"]
          }
        }
      },
      commonjsOptions: {
        include: [/node_modules/]
      }
    }
  };
});
