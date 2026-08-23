export type Dict = {
	nav: {
		dashboard: string;
		libraries: string;
		settings: string;
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
		title: string;
		locale: string;
	};
};

export const dict: Dict = {
	nav: {
		dashboard: "Dashboard",
		libraries: "Libraries",
		settings: "Settings",
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
		title: "Settings",
		locale: "Language",
	},
};
