import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [tailwindcss(), solid()],
	server: {
		proxy: {
			"/api": "http://localhost:8080",
		},
	},
});
