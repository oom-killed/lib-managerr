export type Dict = {
	nav: {
		dashboard: string;
	};
	dashboard: {
		title: string;
		backendStatus: string;
		checking: string;
	};
};

export const dict: Dict = {
	nav: {
		dashboard: "Dashboard",
	},
	dashboard: {
		title: "Dashboard",
		backendStatus: "backend status: {{status}}",
		checking: "checking...",
	},
};
