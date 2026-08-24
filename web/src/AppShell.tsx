import { Navbar, NavGroup, NavLink, Sidebar } from "@lib-managerr/ui";
import { A, useLocation } from "@solidjs/router";
import type { JSX } from "solid-js";
import { useI18n } from "./i18n/index.tsx";

export function AppShell(props: { children?: JSX.Element }) {
	const location = useLocation();
	const { t } = useI18n();
	const isActive = (href: string) => location.pathname === href;

	return (
		<div class="flex min-h-screen flex-col">
			<Navbar>lib-managerr</Navbar>
			<div class="flex flex-1">
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
					<NavGroup label={t("nav.settings")}>
						<NavLink
							as={A}
							href="/settings/general"
							label={t("settingsNav.general")}
							isActive={isActive("/settings/general")}
						/>
						<NavLink
							as={A}
							href="/settings/libraries"
							label={t("settingsNav.libraries")}
							isActive={isActive("/settings/libraries")}
						/>
					</NavGroup>
				</Sidebar>
				<main class="flex-1 p-4">{props.children}</main>
			</div>
		</div>
	);
}
