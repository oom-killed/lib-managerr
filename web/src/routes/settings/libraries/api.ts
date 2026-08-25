import type { ConnectionType } from "./connectionTypes.ts";

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
