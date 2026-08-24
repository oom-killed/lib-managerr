export type Dict = {
	common: {
		save: string;
		cancel: string;
		close: string;
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
			modalTitleView: string;
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
			modalTitleView: "Library",
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
