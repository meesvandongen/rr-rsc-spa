import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
  // @vitejs/plugin-rsc must come after the React Router RSC plugin.
  plugins: [reactRouterRSC(), rsc()],
  resolve: {
    tsconfigPaths: true,
  },
});
