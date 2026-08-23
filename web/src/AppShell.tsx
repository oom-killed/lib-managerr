import { Navbar, NavLink, Sidebar } from "@lib-managerr/ui";
import { A, useLocation } from "@solidjs/router";
import type { JSX } from "solid-js";

const NAV_ITEMS = [{ href: "/", label: "Dashboard" }];

export function AppShell(props: { children?: JSX.Element }) {
	const location = useLocation();

	return (
		<div class="flex min-h-screen flex-col">
			<Navbar>lib-managerr</Navbar>
			<div class="flex flex-1">
				<Sidebar>
					{NAV_ITEMS.map((item) => (
						<NavLink
							as={A}
							href={item.href}
							label={item.label}
							isActive={location.pathname === item.href}
						/>
					))}
				</Sidebar>
				<main class="flex-1 p-4">{props.children}</main>
			</div>
		</div>
	);
}
