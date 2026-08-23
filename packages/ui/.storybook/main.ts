import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	framework: "storybook-solidjs-vite",
	addons: [],
	async viteFinal(viteConfig) {
		viteConfig.plugins ??= [];
		viteConfig.plugins.push(tailwindcss());
		return viteConfig;
	},
};

export default config;
