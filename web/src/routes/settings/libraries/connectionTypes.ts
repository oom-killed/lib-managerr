// The extensibility seam for adding more connection types later: a new
// type means a new ConnectionType union member, a CONNECTION_TYPE_OPTIONS
// entry, and a CONNECTION_TYPE_FIELDS entry — the form/modal/list code
// itself doesn't change.

export type ConnectionType = "plex";

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
	// Whether this field is shown in read-only "view" mode. Secrets like
	// the token aren't returned by the API, so they can't be viewed.
	viewable: boolean;
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
		{
			key: "name",
			labelKey: "settings.libraries.fields.name",
			kind: "text",
			viewable: true,
		},
		{
			key: "host",
			labelKey: "settings.libraries.fields.host",
			kind: "text",
			viewable: true,
		},
		{
			key: "port",
			labelKey: "settings.libraries.fields.port",
			kind: "number",
			viewable: true,
		},
		{
			key: "ssl",
			labelKey: "settings.libraries.fields.ssl",
			kind: "checkbox",
			viewable: true,
		},
		{
			key: "token",
			labelKey: "settings.libraries.fields.token",
			kind: "password",
			viewable: false,
		},
	],
};
