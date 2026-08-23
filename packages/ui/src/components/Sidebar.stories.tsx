import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { NavLink } from "./NavLink.tsx";
import { Sidebar } from "./Sidebar.tsx";

const meta: Meta<typeof Sidebar> = {
	component: Sidebar,
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
	args: {
		children: (
			<>
				<NavLink href="/" label="Dashboard" isActive />
				<NavLink href="/rules" label="Rules" />
			</>
		),
	},
};
