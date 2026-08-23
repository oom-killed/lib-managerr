import { createResource } from "solid-js";
import { useI18n } from "../i18n/index.tsx";

async function fetchHealth() {
	const res = await fetch("/api/health");
	return (await res.json()) as { status: string };
}

function Dashboard() {
	const { t } = useI18n();
	const [health] = createResource(fetchHealth);

	return (
		<section>
			<h1>{t("dashboard.title")}</h1>
			<p>
				{t("dashboard.backendStatus", {
					status: health.loading
						? t("dashboard.checking")
						: (health()?.status ?? ""),
				})}
			</p>
		</section>
	);
}

export default Dashboard;
