import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Navbar } from "./Navbar.tsx";

const meta: Meta<typeof Navbar> = {
	component: Navbar,
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
	args: {
		children: "lib-managerr",
	},
};
