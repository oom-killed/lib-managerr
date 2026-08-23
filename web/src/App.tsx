import { Route, Router } from "@solidjs/router";
import { AppShell } from "./AppShell.tsx";
import Dashboard from "./routes/Dashboard.tsx";

function App() {
	return (
		<Router root={AppShell}>
			<Route path="/" component={Dashboard} />
		</Router>
	);
}

export default App;
