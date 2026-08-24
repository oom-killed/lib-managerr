import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Checkbox } from "./Checkbox.tsx";

const meta: Meta<typeof Checkbox> = {
	component: Checkbox,
	args: {
		id: "ssl",
		label: "Use SSL",
		checked: false,
		onChange: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {};

export const Checked: Story = {
	args: {
		checked: true,
	},
};
