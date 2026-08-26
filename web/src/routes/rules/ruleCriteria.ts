// Registry of selectable criteria fields for a rule's condition tree,
// grouped by the data source they come from. Field ids are stored
// verbatim in Rule.criteria — the backend only validates tree shape
// (group/condition structure), not these values, so this registry is
// the only place that needs to change to add a new field.

export type CriteriaValueKind = "date" | "number" | "boolean";

export type CriteriaOperatorLabelKey =
	| "rules.criteriaOperators.before"
	| "rules.criteriaOperators.after"
	| "rules.criteriaOperators.olderThanDays"
	| "rules.criteriaOperators.newerThanDays"
	| "rules.criteriaOperators.neverWatched"
	| "rules.criteriaOperators.equals"
	| "rules.criteriaOperators.notEquals"
	| "rules.criteriaOperators.greaterThan"
	| "rules.criteriaOperators.lessThan"
	| "rules.criteriaOperators.is"
	| "rules.criteriaOperators.isNot";

export type CriteriaFieldLabelKey =
	| "rules.criteriaFields.plexAddedDate"
	| "rules.criteriaFields.plexLastWatchedDate"
	| "rules.criteriaFields.plexViewCount"
	| "rules.criteriaFields.plexReleaseYear"
	| "rules.criteriaFields.radarrMonitored"
	| "rules.criteriaFields.radarrQualityProfile"
	| "rules.criteriaFields.sonarrMonitored"
	| "rules.criteriaFields.sonarrQualityProfile"
	| "rules.criteriaFields.sonarrSeasonCount"
	| "rules.criteriaFields.sonarrEpisodeCount";

export type CriteriaOperator = {
	id: string;
	labelKey: CriteriaOperatorLabelKey;
	// Some operators (e.g. "never watched") are a complete condition on
	// their own — no value input is shown for them.
	needsValue: boolean;
};

export type CriteriaField = {
	id: string;
	labelKey: CriteriaFieldLabelKey;
	valueKind: CriteriaValueKind;
	operators: CriteriaOperator[];
	// Restricts this field to libraries of the given media type(s).
	// Omitted means available for any media type (currently just the Plex
	// fields, which apply to both movies and shows).
	mediaTypes?: string[];
};

const dateOperators: CriteriaOperator[] = [
	{
		id: "before",
		labelKey: "rules.criteriaOperators.before",
		needsValue: true,
	},
	{ id: "after", labelKey: "rules.criteriaOperators.after", needsValue: true },
	{
		id: "olderThanDays",
		labelKey: "rules.criteriaOperators.olderThanDays",
		needsValue: true,
	},
	{
		id: "newerThanDays",
		labelKey: "rules.criteriaOperators.newerThanDays",
		needsValue: true,
	},
];

const numberOperators: CriteriaOperator[] = [
	{
		id: "equals",
		labelKey: "rules.criteriaOperators.equals",
		needsValue: true,
	},
	{
		id: "greaterThan",
		labelKey: "rules.criteriaOperators.greaterThan",
		needsValue: true,
	},
	{
		id: "lessThan",
		labelKey: "rules.criteriaOperators.lessThan",
		needsValue: true,
	},
];

const booleanOperators: CriteriaOperator[] = [
	{ id: "is", labelKey: "rules.criteriaOperators.is", needsValue: true },
	{ id: "isNot", labelKey: "rules.criteriaOperators.isNot", needsValue: true },
];

export const CRITERIA_FIELDS: CriteriaField[] = [
	// Plex — applies to any library.
	{
		id: "plex.addedDate",
		labelKey: "rules.criteriaFields.plexAddedDate",
		valueKind: "date",
		operators: dateOperators,
	},
	{
		id: "plex.lastWatchedDate",
		labelKey: "rules.criteriaFields.plexLastWatchedDate",
		valueKind: "date",
		operators: [
			...dateOperators,
			{
				id: "neverWatched",
				labelKey: "rules.criteriaOperators.neverWatched",
				needsValue: false,
			},
		],
	},
	{
		id: "plex.viewCount",
		labelKey: "rules.criteriaFields.plexViewCount",
		valueKind: "number",
		operators: numberOperators,
	},
	{
		id: "plex.releaseYear",
		labelKey: "rules.criteriaFields.plexReleaseYear",
		valueKind: "number",
		operators: numberOperators,
	},
	// Radarr — movie libraries only.
	{
		id: "radarr.monitored",
		labelKey: "rules.criteriaFields.radarrMonitored",
		valueKind: "boolean",
		operators: booleanOperators,
		mediaTypes: ["movie"],
	},
	{
		id: "radarr.qualityProfile",
		labelKey: "rules.criteriaFields.radarrQualityProfile",
		valueKind: "number",
		operators: [
			{
				id: "equals",
				labelKey: "rules.criteriaOperators.equals",
				needsValue: true,
			},
			{
				id: "notEquals",
				labelKey: "rules.criteriaOperators.notEquals",
				needsValue: true,
			},
		],
	},
	// Sonarr — show libraries only.
	{
		id: "sonarr.monitored",
		labelKey: "rules.criteriaFields.sonarrMonitored",
		valueKind: "boolean",
		operators: booleanOperators,
		mediaTypes: ["show"],
	},
	{
		id: "sonarr.qualityProfile",
		labelKey: "rules.criteriaFields.sonarrQualityProfile",
		valueKind: "number",
		operators: [
			{
				id: "equals",
				labelKey: "rules.criteriaOperators.equals",
				needsValue: true,
			},
			{
				id: "notEquals",
				labelKey: "rules.criteriaOperators.notEquals",
				needsValue: true,
			},
		],
		mediaTypes: ["show"],
	},
	{
		id: "sonarr.seasonCount",
		labelKey: "rules.criteriaFields.sonarrSeasonCount",
		valueKind: "number",
		operators: numberOperators,
		mediaTypes: ["show"],
	},
	{
		id: "sonarr.episodeCount",
		labelKey: "rules.criteriaFields.sonarrEpisodeCount",
		valueKind: "number",
		operators: numberOperators,
		mediaTypes: ["show"],
	},
];

// Fields applicable to a library of the given media type, or every field
// when mediaType is unknown (e.g. no library selected yet).
export function criteriaFieldsFor(
	mediaType: string | undefined,
): CriteriaField[] {
	if (mediaType === undefined) {
		return CRITERIA_FIELDS;
	}
	return CRITERIA_FIELDS.filter(
		(f) => f.mediaTypes === undefined || f.mediaTypes.includes(mediaType),
	);
}

export function findCriteriaField(id: string): CriteriaField | undefined {
	return CRITERIA_FIELDS.find((f) => f.id === id);
}
