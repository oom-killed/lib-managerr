import type { Component, JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

export type NavLinkProps = {
	href: string;
	label: string;
	isActive?: boolean;
	as?: Component<{ href: string; class?: string; children?: JSX.Element }>;
};

export function NavLink(props: NavLinkProps) {
	return (
		<Dynamic
			component={props.as ?? "a"}
			href={props.href}
			class="block rounded px-2 py-1 text-sm"
			classList={{
				"bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50":
					props.isActive,
				"text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900":
					!props.isActive,
			}}
		>
			{props.label}
		</Dynamic>
	);
}
