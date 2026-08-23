export type Dict = {
	nav: {
		dashboard: string;
		settings: string;
	};
	dashboard: {
		title: string;
		backendStatus: string;
		checking: string;
	};
	settings: {
		title: string;
		locale: string;
	};
};

export const dict: Dict = {
	nav: {
		dashboard: "Dashboard",
		settings: "Settings",
	},
	dashboard: {
		title: "Dashboard",
		backendStatus: "backend status: {{status}}",
		checking: "checking...",
	},
	settings: {
		title: "Settings",
		locale: "Language",
	},
};
