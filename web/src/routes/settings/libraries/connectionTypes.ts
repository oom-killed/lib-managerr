// The extensibility seam for adding more connection types later: a new
// type means a new ConnectionType union member (in ../../../api/connections.ts,
// the canonical source), a CONNECTION_TYPE_OPTIONS entry, and a
// CONNECTION_TYPE_FIELDS entry — the form/modal/list code itself doesn't change.

import type { ConnectionType } from "../../../api/connections.ts";

export type { ConnectionType };

export type ConnectionFieldKey = "name" | "host" | "port" | "ssl" | "token";

export type ConnectionFieldLabelKey =
	| "settings.libraries.fields.name"
	| "settings.libraries.fields.host"
	| "settings.libraries.fields.port"
	| "settings.libraries.fields.ssl"
	| "settings.libraries.fields.token";

export type ConnectionFieldConfig = {
	key: ConnectionFieldKey;
	labelKey: ConnectionFieldLabelKey;
	kind: "text" | "number" | "password" | "checkbox";
};

export const CONNECTION_TYPE_OPTIONS: {
	value: ConnectionType;
	label: string;
}[] = [{ value: "plex", label: "Plex" }];

export const CONNECTION_TYPE_FIELDS: Record<
	ConnectionType,
	ConnectionFieldConfig[]
> = {
	plex: [
		{ key: "name", labelKey: "settings.libraries.fields.name", kind: "text" },
		{ key: "host", labelKey: "settings.libraries.fields.host", kind: "text" },
		{
			key: "port",
			labelKey: "settings.libraries.fields.port",
			kind: "number",
		},
		{
			key: "ssl",
			labelKey: "settings.libraries.fields.ssl",
			kind: "checkbox",
		},
		{
			key: "token",
			labelKey: "settings.libraries.fields.token",
			kind: "password",
		},
	],
};
