import type { JSX } from "solid-js";

export type NavbarProps = {
	children?: JSX.Element;
};

export function Navbar(props: NavbarProps) {
	return (
		<header class="sticky top-0 z-10 flex-none border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
			{props.children}
		</header>
	);
}
