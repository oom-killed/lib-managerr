import { createResource } from "solid-js";

async function fetchHealth() {
	const res = await fetch("/api/health");
	return (await res.json()) as { status: string };
}

function App() {
	const [health] = createResource(fetchHealth);

	return (
		<main>
			<h1>lib-managerr</h1>
			<p>backend status: {health.loading ? "checking..." : health()?.status}</p>
		</main>
	);
}

export default App;
