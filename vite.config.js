import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "electron";

export default defineConfig({
  plugins: [react(), electron({
    entry: "main.js",// Path to your main Electron file
  })],
})
