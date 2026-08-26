export type Dict = {
	common: {
		save: string;
		cancel: string;
		close: string;
		previous: string;
		next: string;
		delete: string;
	};
	nav: {
		dashboard: string;
		libraries: string;
		rules: string;
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
		connectionsTitle: string;
		noConnections: string;
		statusOnline: string;
		statusOffline: string;
		statusChecking: string;
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
	rules: {
		title: string;
		empty: string;
		addButton: string;
		modalTitleAdd: string;
		modalTitleEdit: string;
		enabledLabel: string;
		disabledLabel: string;
		noActions: string;
		addAction: string;
		fields: {
			name: string;
			enabled: string;
			action: string;
			connection: string;
			library: string;
			granularity: string;
			actions: string;
			delayAmount: string;
			delayUnit: string;
		};
		actions: {
			changeQualityAndSearch: string;
			delete: string;
			doNothing: string;
			unmonitorAndDeleteFiles: string;
			unmonitorAndKeepFiles: string;
		};
		granularity: {
			season: string;
			episode: string;
		};
		delayUnits: {
			hours: string;
			days: string;
			weeks: string;
			months: string;
		};
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
		delete: "Delete",
	},
	nav: {
		dashboard: "Dashboard",
		libraries: "Libraries",
		rules: "Rules",
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
		connectionsTitle: "Connections",
		noConnections:
			"No connections configured yet. Add one in Settings › Connections.",
		statusOnline: "Online",
		statusOffline: "Offline",
		statusChecking: "Checking...",
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
	rules: {
		title: "Rules",
		empty: "No rules configured yet.",
		addButton: "Add Rule",
		modalTitleAdd: "Add Rule",
		modalTitleEdit: "Edit Rule",
		enabledLabel: "Enabled",
		disabledLabel: "Disabled",
		noActions: "No actions",
		addAction: "Add Action",
		fields: {
			name: "Name",
			enabled: "Enabled",
			action: "Action",
			connection: "Connection",
			library: "Library",
			granularity: "Applies to",
			actions: "Actions",
			delayAmount: "Delay",
			delayUnit: "Unit",
		},
		actions: {
			changeQualityAndSearch: "Change quality profile and search",
			delete: "Delete",
			doNothing: "Do nothing",
			unmonitorAndDeleteFiles: "Unmonitor and delete files",
			unmonitorAndKeepFiles: "Unmonitor and keep files",
		},
		granularity: {
			season: "Seasons",
			episode: "Episodes",
		},
		delayUnits: {
			hours: "hours",
			days: "days",
			weeks: "weeks",
			months: "months",
		},
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
