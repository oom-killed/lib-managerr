import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { NavLink } from "./NavLink.tsx";

const meta: Meta<typeof NavLink> = {
	component: NavLink,
	args: {
		href: "/",
		label: "Dashboard",
	},
};

export default meta;

type Story = StoryObj<typeof NavLink>;

export const Inactive: Story = {};

export const Active: Story = {
	args: {
		isActive: true,
	},
};
