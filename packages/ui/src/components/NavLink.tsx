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
				"bg-neutral-200 dark:bg-neutral-800": props.isActive,
				"hover:bg-neutral-100 dark:hover:bg-neutral-900": !props.isActive,
			}}
		>
			{props.label}
		</Dynamic>
	);
}
