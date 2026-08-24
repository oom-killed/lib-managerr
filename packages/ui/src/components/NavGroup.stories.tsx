import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { NavGroup } from "./NavGroup.tsx";
import { NavLink } from "./NavLink.tsx";

const meta: Meta<typeof NavGroup> = {
	component: NavGroup,
	args: {
		label: "Settings",
	},
};

export default meta;

type Story = StoryObj<typeof NavGroup>;

export const Default: Story = {
	args: {
		children: (
			<>
				<NavLink href="/settings/general" label="General" isActive />
				<NavLink href="/settings/libraries" label="Libraries" />
			</>
		),
	},
};
