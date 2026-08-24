import type { JSX } from "solid-js";

export type NavGroupProps = {
	label: string;
	children?: JSX.Element;
};

export function NavGroup(props: NavGroupProps) {
	return (
		<div class="mt-4 first:mt-0">
			<div class="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
				{props.label}
			</div>
			<div class="ml-2 flex flex-col gap-1 border-l border-neutral-200 pl-2 dark:border-neutral-800">
				{props.children}
			</div>
		</div>
	);
}
