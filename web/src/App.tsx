import { Route, Router } from "@solidjs/router";
import { AppShell } from "./AppShell.tsx";
import { I18nProvider } from "./i18n/index.tsx";
import Dashboard from "./routes/Dashboard.tsx";

function App() {
	return (
		<I18nProvider>
			<Router root={AppShell}>
				<Route path="/" component={Dashboard} />
			</Router>
		</I18nProvider>
	);
}

export default App;
