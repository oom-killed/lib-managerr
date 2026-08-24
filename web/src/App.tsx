import { Navigate, Route, Router } from "@solidjs/router";
import { AppShell } from "./AppShell.tsx";
import { I18nProvider } from "./i18n/index.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import Libraries from "./routes/Libraries.tsx";
import General from "./routes/settings/General.tsx";
import SettingsLibraries from "./routes/settings/Libraries.tsx";

function App() {
	return (
		<I18nProvider>
			<Router root={AppShell}>
				<Route path="/" component={Dashboard} />
				<Route path="/libraries" component={Libraries} />
				<Route
					path="/settings"
					component={() => <Navigate href="/settings/general" />}
				/>
				<Route path="/settings/general" component={General} />
				<Route path="/settings/libraries" component={SettingsLibraries} />
			</Router>
		</I18nProvider>
	);
}

export default App;
