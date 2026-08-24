import type { JSX } from "solid-js";

export type ButtonProps = {
	type?: "button" | "submit";
	variant?: "primary" | "secondary";
	onClick?: () => void;
	disabled?: boolean;
	children?: JSX.Element;
};

export function Button(props: ButtonProps) {
	const variant = () => props.variant ?? "primary";

	return (
		<button
			type={props.type ?? "button"}
			onClick={props.onClick}
			disabled={props.disabled}
			class="appearance-none rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50"
			classList={{
				"bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200":
					variant() === "primary",
				"border border-neutral-300 text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-800":
					variant() === "secondary",
			}}
		>
			{props.children}
		</button>
	);
}
