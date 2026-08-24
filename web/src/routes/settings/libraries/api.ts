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
