import { StatusBadge } from "@lib-managerr/ui";
import { createResource, For, onCleanup, Show } from "solid-js";
import {
	type Connection,
	type ConnectionStatus,
	fetchConnectionStatuses,
	fetchConnections,
} from "../api/connections.ts";
import { useI18n } from "../i18n/index.tsx";

async function fetchHealth() {
	const res = await fetch("/api/health");
	return (await res.json()) as { status: string };
}

// Polls slightly more often than the backend's default health-check
// interval (CONNECTION_HEALTH_INTERVAL, 60s) so a freshly-refreshed status
// shows up promptly without a second round-trip just to learn the
// backend's configured interval.
const STATUS_POLL_INTERVAL_MS = 45_000;

function ConnectionsStatus() {
	const { t } = useI18n();
	const [connections] = createResource(fetchConnections);
	const [statuses, { refetch }] = createResource(fetchConnectionStatuses);

	const timer = setInterval(refetch, STATUS_POLL_INTERVAL_MS);
	onCleanup(() => clearInterval(timer));

	const statusFor = (id: number): ConnectionStatus | undefined =>
		statuses()?.find((s) => s.id === id);

	return (
		<section class="flex flex-col gap-2">
			<h2 class="text-lg font-medium">{t("dashboard.connectionsTitle")}</h2>
			<Show
				when={(connections()?.length ?? 0) > 0}
				fallback={<p>{t("dashboard.noConnections")}</p>}
			>
				<ul class="flex flex-col gap-1">
					<For each={connections()}>
						{(conn: Connection) => {
							const status = () => statusFor(conn.id);
							const badgeStatus = () =>
								status() === undefined
									? "checking"
									: status()?.ok
										? "online"
										: "offline";
							const badgeLabel = () =>
								status() === undefined
									? t("dashboard.statusChecking")
									: status()?.ok
										? t("dashboard.statusOnline")
										: t("dashboard.statusOffline");

							return (
								<li class="flex items-center justify-between rounded border border-neutral-200 p-2 dark:border-neutral-800">
									<span>
										<span class="font-medium">{conn.name}</span>
										<span class="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
											{conn.type}
										</span>
									</span>
									<StatusBadge status={badgeStatus()} label={badgeLabel()} />
								</li>
							);
						}}
					</For>
				</ul>
			</Show>
		</section>
	);
}

function Dashboard() {
	const { t } = useI18n();
	const [health] = createResource(fetchHealth);

	return (
		<section class="flex flex-col gap-6">
			<div>
				<h1 class="text-xl font-semibold">{t("dashboard.title")}</h1>
				<p>
					{t("dashboard.backendStatus", {
						status: health.loading
							? t("dashboard.checking")
							: (health()?.status ?? ""),
					})}
				</p>
			</div>
			<ConnectionsStatus />
		</section>
	);
}

export default Dashboard;
