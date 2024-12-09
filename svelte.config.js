import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"; // Only use this

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(), // Use only vitePreprocess()

  kit: {
    adapter: adapter({ 
      pages: "build", 
      assets: "build", 
      fallback: undefined, 
      precompress: false, 
      strict: true 
    }),
    paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
  }
};

export default config;
