import { Navbar, NavGroup, NavLink, Sidebar } from "@lib-managerr/ui";
import { A, useLocation } from "@solidjs/router";
import type { JSX } from "solid-js";
import { useI18n } from "./i18n/index.tsx";

export function AppShell(props: { children?: JSX.Element }) {
	const location = useLocation();
	const { t } = useI18n();
	const isActive = (href: string) => location.pathname === href;

	return (
		<div class="flex h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
			<Navbar>lib-managerr</Navbar>
			<div class="flex min-h-0 flex-1">
				<Sidebar>
					<NavLink
						as={A}
						href="/"
						label={t("nav.dashboard")}
						isActive={isActive("/")}
					/>
					<NavLink
						as={A}
						href="/libraries"
						label={t("nav.libraries")}
						isActive={isActive("/libraries")}
					/>
					<NavLink
						as={A}
						href="/rules"
						label={t("nav.rules")}
						isActive={isActive("/rules")}
					/>
					<NavGroup label={t("nav.settings")}>
						<NavLink
							as={A}
							href="/settings/general"
							label={t("settingsNav.general")}
							isActive={isActive("/settings/general")}
						/>
						<NavLink
							as={A}
							href="/settings/connections"
							label={t("settingsNav.connections")}
							isActive={isActive("/settings/connections")}
						/>
					</NavGroup>
				</Sidebar>
				<main class="flex-1 overflow-y-auto p-4">{props.children}</main>
			</div>
		</div>
	);
}
