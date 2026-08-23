import { createResource } from "solid-js";

async function fetchHealth() {
	const res = await fetch("/api/health");
	return (await res.json()) as { status: string };
}

function Dashboard() {
	const [health] = createResource(fetchHealth);

	return (
		<section>
			<h1>Dashboard</h1>
			<p>backend status: {health.loading ? "checking..." : health()?.status}</p>
		</section>
	);
}

export default Dashboard;
