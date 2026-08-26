import type { RuleAction } from "../../api/rules.ts";

export type RuleActionLabelKey =
	| "rules.actions.changeQualityAndSearch"
	| "rules.actions.delete"
	| "rules.actions.doNothing"
	| "rules.actions.unmonitorAndDeleteFiles"
	| "rules.actions.unmonitorAndKeepFiles";

export type RuleActionOption = {
	value: RuleAction;
	labelKey: RuleActionLabelKey;
	// Library media types this action applies to. Omitted means universal
	// (applies regardless of library type) — currently just "do_nothing",
	// since every other action is Radarr-specific and Radarr only tracks
	// movies.
	mediaTypes?: string[];
};

export const RULE_ACTION_OPTIONS: RuleActionOption[] = [
	{
		value: "do_nothing",
		labelKey: "rules.actions.doNothing",
	},
	{
		value: "change_quality_and_search",
		labelKey: "rules.actions.changeQualityAndSearch",
		mediaTypes: ["movie"],
	},
	{
		value: "unmonitor_and_keep_files",
		labelKey: "rules.actions.unmonitorAndKeepFiles",
		mediaTypes: ["movie"],
	},
	{
		value: "unmonitor_and_delete_files",
		labelKey: "rules.actions.unmonitorAndDeleteFiles",
		mediaTypes: ["movie"],
	},
	{
		value: "delete",
		labelKey: "rules.actions.delete",
		mediaTypes: ["movie"],
	},
];

// Options applicable to a library of the given media type ("movie",
// "show", ...), or every option when mediaType is unknown (e.g. no
// library selected yet).
export function ruleActionOptionsFor(
	mediaType: string | undefined,
): RuleActionOption[] {
	if (mediaType === undefined) {
		return RULE_ACTION_OPTIONS;
	}
	return RULE_ACTION_OPTIONS.filter(
		(o) => o.mediaTypes === undefined || o.mediaTypes.includes(mediaType),
	);
}
