import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Select } from "./Select.tsx";

const meta: Meta<typeof Select> = {
	component: Select,
	args: {
		options: [
			{ value: "en", label: "English" },
			{ value: "fr", label: "Français" },
		],
		value: "en",
		onChange: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
