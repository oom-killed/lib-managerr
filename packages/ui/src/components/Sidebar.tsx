import type { JSX } from "solid-js";

export type SidebarProps = {
	children?: JSX.Element;
};

export function Sidebar(props: SidebarProps) {
	return (
		<nav class="sticky top-0 w-48 flex-none border-r border-neutral-200 p-4 dark:border-neutral-800">
			{props.children}
		</nav>
	);
}
