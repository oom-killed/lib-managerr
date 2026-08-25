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
		libraries: string;
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
	};
	settings: {
		general: {
			title: string;
			locale: string;
		};
		libraries: {
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
		libraries: "Libraries",
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
			"No connections configured yet. Add one in Settings › Libraries.",
		loadError: "Failed to load libraries from this server.",
		noLibraries: "No libraries found on this server.",
		itemsLoadError: "Failed to load items from this library.",
		noItems: "No items in this library.",
		pageRange: "{{start}}–{{end}} of {{total}}",
	},
	settings: {
		general: {
			title: "General",
			locale: "Language",
		},
		libraries: {
			title: "Libraries",
			addButton: "Add Library",
			empty: "No libraries connected yet.",
			modalTitleAdd: "Add Library",
			modalTitleEdit: "Edit Library",
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
			},
		},
	},
};
