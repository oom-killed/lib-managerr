export type Dict = {
	common: {
		save: string;
		cancel: string;
		close: string;
		previous: string;
		next: string;
	};
	nav: {
		dashboard: string;
		libraries: string;
		settings: string;
	};
	settingsNav: {
		general: string;
		connections: string;
	};
	dashboard: {
		title: string;
		backendStatus: string;
		checking: string;
	};
	libraries: {
		title: string;
		connectionLabel: string;
		libraryLabel: string;
		noConnections: string;
		loadError: string;
		noLibraries: string;
		itemsLoadError: string;
		noItems: string;
		pageRange: string;
		showMeta: string;
		radarrMonitored: string;
		radarrUnmonitored: string;
		radarrNotTracked: string;
		sonarrMonitored: string;
		sonarrUnmonitored: string;
		sonarrNotTracked: string;
	};
	settings: {
		general: {
			title: string;
			locale: string;
		};
		connections: {
			title: string;
			addButton: string;
			empty: string;
			modalTitleAdd: string;
			modalTitleEdit: string;
			tokenEditHint: string;
			testButton: string;
			testing: string;
			testSuccess: string;
			testFailure: string;
			fields: {
				name: string;
				host: string;
				port: string;
				ssl: string;
				token: string;
				apiKey: string;
			};
		};
	};
};

export const dict: Dict = {
	common: {
		save: "Save",
		cancel: "Cancel",
		close: "Close",
		previous: "Previous",
		next: "Next",
	},
	nav: {
		dashboard: "Dashboard",
		libraries: "Libraries",
		settings: "Settings",
	},
	settingsNav: {
		general: "General",
		connections: "Connections",
	},
	dashboard: {
		title: "Dashboard",
		backendStatus: "backend status: {{status}}",
		checking: "checking...",
	},
	libraries: {
		title: "Libraries",
		connectionLabel: "Connection",
		libraryLabel: "Library",
		noConnections:
			"No Plex connections configured yet. Add one in Settings › Connections.",
		loadError: "Failed to load libraries from this server.",
		noLibraries: "No libraries found on this server.",
		itemsLoadError: "Failed to load items from this library.",
		noItems: "No items in this library.",
		pageRange: "{{start}}–{{end}} of {{total}}",
		showMeta: "{{seasons}} seasons, {{episodes}} episodes",
		radarrMonitored: "Monitored",
		radarrUnmonitored: "Unmonitored",
		radarrNotTracked: "Not tracked in Radarr",
		sonarrMonitored: "Monitored",
		sonarrUnmonitored: "Unmonitored",
		sonarrNotTracked: "Not tracked in Sonarr",
	},
	settings: {
		general: {
			title: "General",
			locale: "Language",
		},
		connections: {
			title: "Connections",
			addButton: "Add Connection",
			empty: "No connections configured yet.",
			modalTitleAdd: "Add Connection",
			modalTitleEdit: "Edit Connection",
			tokenEditHint: "Leave blank to keep the current token",
			testButton: "Test Connection",
			testing: "Testing...",
			testSuccess: "Connection successful",
			testFailure: "Connection failed: {{error}}",
			fields: {
				name: "Name",
				host: "Host",
				port: "Port",
				ssl: "Use SSL",
				token: "Token",
				apiKey: "API Key",
			},
		},
	},
};
