import { Navigate, Route, Router } from "@solidjs/router";
import { AppShell } from "./AppShell.tsx";
import { I18nProvider } from "./i18n/index.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import Libraries from "./routes/Libraries.tsx";
import Rules from "./routes/Rules.tsx";
import Connections from "./routes/settings/Connections.tsx";
import General from "./routes/settings/General.tsx";
import { LibrarySelectionProvider } from "./state/librarySelection.tsx";

function App() {
	return (
		<I18nProvider>
			<LibrarySelectionProvider>
				<Router root={AppShell}>
					<Route path="/" component={Dashboard} />
					<Route path="/libraries" component={Libraries} />
					<Route path="/rules" component={Rules} />
					<Route
						path="/settings"
						component={() => <Navigate href="/settings/general" />}
					/>
					<Route path="/settings/general" component={General} />
					<Route path="/settings/connections" component={Connections} />
				</Router>
			</LibrarySelectionProvider>
		</I18nProvider>
	);
}

export default App;
