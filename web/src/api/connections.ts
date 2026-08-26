// Shared across routes: settings/connections owns Connection CRUD, the root
// Libraries page uses fetchConnections + fetchConnectionLibraries to build
// its connection/library selector.

export type ConnectionType = "plex" | "radarr" | "sonarr" | "seerr";

// Media-server-type connections (Plex, and eventually Jellyfin/Emby) have
// browsable library sections; data-only connections (Radarr, Sonarr,
// Seerr, ...) don't — they're used to fetch additional data, not to browse
// media. The root Libraries page's connection picker filters to this list.
export const LIBRARY_CAPABLE_CONNECTION_TYPES: ConnectionType[] = ["plex"];

export type Connection = {
	id: number;
	type: ConnectionType;
	name: string;
	host: string;
	port: number;
	ssl: boolean;
};

export type ConnectionInput = {
	type: ConnectionType;
	name: string;
	host: string;
	port: number;
	ssl: boolean;
	token: string;
};

export async function fetchConnections(): Promise<Connection[]> {
	const res = await fetch("/api/connections");
	if (!res.ok) {
		throw new Error("failed to load connections");
	}
	return res.json();
}

export async function createConnection(
	input: ConnectionInput,
): Promise<Connection> {
	const res = await fetch("/api/connections", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to create connection");
	}
	return res.json();
}

export async function updateConnection(
	id: number,
	input: ConnectionInput,
): Promise<Connection> {
	const res = await fetch(`/api/connections/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to update connection");
	}
	return res.json();
}

export type TestConnectionInput = {
	type: ConnectionType;
	host: string;
	port: number;
	ssl: boolean;
	token: string;
};

export type TestConnectionResult = { ok: boolean; error?: string };

// For a not-yet-saved connection: token must come from the form, since
// there's nothing persisted to fall back to.
export async function testConnection(
	input: TestConnectionInput,
): Promise<TestConnectionResult> {
	const res = await fetch("/api/connections/test", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to test connection");
	}
	return res.json();
}

// For an existing connection: an empty token falls back to the stored one,
// matching updateConnection's "blank means unchanged" contract.
export async function testExistingConnection(
	id: number,
	input: TestConnectionInput,
): Promise<TestConnectionResult> {
	const res = await fetch(`/api/connections/${id}/test`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to test connection");
	}
	return res.json();
}

export type LibrarySection = {
	key: string;
	title: string;
	type: string;
};

export async function fetchConnectionLibraries(
	connectionId: number,
): Promise<LibrarySection[]> {
	const res = await fetch(`/api/connections/${connectionId}/libraries`);
	if (!res.ok) {
		throw new Error("failed to load libraries");
	}
	return res.json();
}

export type LibraryItem = {
	key: string;
	title: string;
	year?: number;
	type: string;
	seasonCount?: number;
	episodeCount?: number;
	radarr?: {
		tracked: boolean;
		monitored?: boolean;
		qualityProfile?: string;
	};
	sonarr?: {
		tracked: boolean;
		monitored?: boolean;
		qualityProfile?: string;
	};
};

export type LibraryItemsPage = {
	items: LibraryItem[];
	total: number;
	offset: number;
	limit: number;
};

export type FetchLibraryItemsParams = {
	connectionId: number;
	libraryKey: string;
	offset: number;
	limit: number;
};

export async function fetchLibraryItems({
	connectionId,
	libraryKey,
	offset,
	limit,
}: FetchLibraryItemsParams): Promise<LibraryItemsPage> {
	const params = new URLSearchParams({
		offset: String(offset),
		limit: String(limit),
	});
	const res = await fetch(
		`/api/connections/${connectionId}/libraries/${libraryKey}/items?${params}`,
	);
	if (!res.ok) {
		throw new Error("failed to load library items");
	}
	return res.json();
}
