import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxDev: false,
    jsxFactory: "Didact.createElement",
    jsxFragment: "Didact.Fragment",
  },
});
