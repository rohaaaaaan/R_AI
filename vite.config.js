import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: "main.js",  // Path to your main Electron file
    }),
      monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html']
    })
  ],
  base: "./",  // Makes the assets load correctly in Electron
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
