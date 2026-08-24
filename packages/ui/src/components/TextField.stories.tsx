import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { TextField } from "./TextField.tsx";

const meta: Meta<typeof TextField> = {
	component: TextField,
	args: {
		id: "name",
		label: "Name",
		value: "",
		onChange: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {};

export const WithValue: Story = {
	args: {
		value: "Living Room",
	},
};

export const Disabled: Story = {
	args: {
		value: "Living Room",
		disabled: true,
	},
};
