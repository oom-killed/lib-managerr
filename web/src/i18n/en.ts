export type Dict = {
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
		};
	};
};

export const dict: Dict = {
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
		},
	},
};
