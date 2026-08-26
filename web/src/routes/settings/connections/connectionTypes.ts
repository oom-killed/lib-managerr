// The extensibility seam for adding more connection types later: a new
// type means a new ConnectionType union member (in ../../../api/connections.ts,
// the canonical source), a CONNECTION_TYPE_OPTIONS entry, and a
// CONNECTION_TYPE_FIELDS entry — the form/modal/list code itself doesn't change.

import type { ConnectionType } from "../../../api/connections.ts";

export type { ConnectionType };

export type ConnectionFieldKey = "name" | "host" | "port" | "ssl" | "token";

export type ConnectionFieldLabelKey =
	| "settings.connections.fields.name"
	| "settings.connections.fields.host"
	| "settings.connections.fields.port"
	| "settings.connections.fields.ssl"
	| "settings.connections.fields.token"
	| "settings.connections.fields.apiKey";

export type ConnectionFieldConfig = {
	key: ConnectionFieldKey;
	labelKey: ConnectionFieldLabelKey;
	kind: "text" | "number" | "password" | "checkbox";
};

export const CONNECTION_TYPE_OPTIONS: {
	value: ConnectionType;
	label: string;
}[] = [
	{ value: "plex", label: "Plex" },
	{ value: "radarr", label: "Radarr" },
	{ value: "sonarr", label: "Sonarr" },
];

export const CONNECTION_TYPE_FIELDS: Record<
	ConnectionType,
	ConnectionFieldConfig[]
> = {
	plex: [
		{ key: "name", labelKey: "settings.connections.fields.name", kind: "text" },
		{ key: "host", labelKey: "settings.connections.fields.host", kind: "text" },
		{
			key: "port",
			labelKey: "settings.connections.fields.port",
			kind: "number",
		},
		{
			key: "ssl",
			labelKey: "settings.connections.fields.ssl",
			kind: "checkbox",
		},
		{
			key: "token",
			labelKey: "settings.connections.fields.token",
			kind: "password",
		},
	],
	radarr: [
		{ key: "name", labelKey: "settings.connections.fields.name", kind: "text" },
		{ key: "host", labelKey: "settings.connections.fields.host", kind: "text" },
		{
			key: "port",
			labelKey: "settings.connections.fields.port",
			kind: "number",
		},
		{
			key: "ssl",
			labelKey: "settings.connections.fields.ssl",
			kind: "checkbox",
		},
		{
			key: "token",
			labelKey: "settings.connections.fields.apiKey",
			kind: "password",
		},
	],
	sonarr: [
		{ key: "name", labelKey: "settings.connections.fields.name", kind: "text" },
		{ key: "host", labelKey: "settings.connections.fields.host", kind: "text" },
		{
			key: "port",
			labelKey: "settings.connections.fields.port",
			kind: "number",
		},
		{
			key: "ssl",
			labelKey: "settings.connections.fields.ssl",
			kind: "checkbox",
		},
		{
			key: "token",
			labelKey: "settings.connections.fields.apiKey",
			kind: "password",
		},
	],
};
