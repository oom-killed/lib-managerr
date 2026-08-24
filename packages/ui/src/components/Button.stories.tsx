import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./Button.tsx";

const meta: Meta<typeof Button> = {
	component: Button,
	args: {
		children: "Save",
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Cancel",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};
