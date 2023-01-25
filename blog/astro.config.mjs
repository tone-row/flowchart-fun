import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";

// TODO: will not work in vercel previews
const site =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001"
    : "https://flowchart.fun";

// https://astro.build/config
export default defineConfig({
  site,
  base: "/blog",
  outDir: "../app/build/blog",
  publicDir: "../app/build/blog",
  output: "server",
  adapter: vercel(),
  integrations: [
    mdx(),
    partytown({
      // Adds dataLayer.push as a forwarding-event.
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    sitemap(),
  ],
});
