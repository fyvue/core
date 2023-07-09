import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
const replaceOptions = {
  __DATE__: new Date().toISOString(),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        // @ts-ignore
        ssr: true,
        compilerOptions: {},
        transformAssetUrls: {
          img: ["src"],
          Image: ["src"],
          Video: ["src"],
        },
      },
    }),
    ///replace(replaceOptions),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    sourcemap: "hidden",
  },
});
