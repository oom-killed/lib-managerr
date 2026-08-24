import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Modal } from "./Modal.tsx";

const meta: Meta<typeof Modal> = {
	component: Modal,
	args: {
		open: true,
		title: "Add Library",
		onClose: () => {},
		children: "Modal content goes here.",
	},
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Open: Story = {};
