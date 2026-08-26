import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { StatusBadge } from "./StatusBadge.tsx";

const meta: Meta<typeof StatusBadge> = {
	component: StatusBadge,
	args: {
		label: "Online",
		status: "online",
	},
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Online: Story = {};

export const Offline: Story = {
	args: {
		status: "offline",
		label: "Offline",
	},
};

export const Checking: Story = {
	args: {
		status: "checking",
		label: "Checking...",
	},
};
