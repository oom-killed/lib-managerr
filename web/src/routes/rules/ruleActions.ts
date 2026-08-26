import type { RuleAction, RuleGranularity } from "../../api/rules.ts";

export type RuleActionLabelKey =
	| "rules.actions.changeQualityAndSearch"
	| "rules.actions.delete"
	| "rules.actions.doNothing"
	| "rules.actions.unmonitorAndDeleteFiles"
	| "rules.actions.unmonitorAndKeepFiles"
	| "rules.actions.deleteEntireShow"
	| "rules.actions.unmonitorShowDeleteAllEpisodes"
	| "rules.actions.unmonitorShowKeepFiles"
	| "rules.actions.unmonitorShowDeleteExistingEpisodes"
	| "rules.actions.seasonUnmonitorDeleteExistingEpisodes"
	| "rules.actions.seasonUnmonitorDeleteSeason"
	| "rules.actions.seasonUnmonitorDeleteSeasonDeleteShowIfEmpty"
	| "rules.actions.seasonUnmonitorAndUnmonitorShowIfEmpty"
	| "rules.actions.seasonUnmonitorKeepFiles"
	| "rules.actions.episodeUnmonitorDeleteEpisode"
	| "rules.actions.episodeUnmonitorKeepFile";

export type RuleActionOption = {
	value: RuleAction;
	labelKey: RuleActionLabelKey;
	// Library media types this action applies to. Omitted means universal
	// (applies regardless of library type) — currently just "do_nothing".
	mediaTypes?: string[];
	// For "show"-media-type actions only: which granularity level(s) this
	// action applies to (Maintainerr's Sonarr option set differs by
	// show/season/episode). Ignored for other media types, since only show
	// libraries have a granularity at all. Omitted means "do_nothing"-style
	// universal applicability across every granularity.
	granularities?: RuleGranularity[];
};

export const RULE_ACTION_OPTIONS: RuleActionOption[] = [
	{
		value: "do_nothing",
		labelKey: "rules.actions.doNothing",
	},
	// Radarr (movie) actions.
	{
		value: "change_quality_and_search",
		labelKey: "rules.actions.changeQualityAndSearch",
		mediaTypes: ["movie", "show"],
		granularities: ["show"],
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
	// Sonarr (show) actions, at the show level.
	{
		value: "delete_entire_show",
		labelKey: "rules.actions.deleteEntireShow",
		mediaTypes: ["show"],
		granularities: ["show"],
	},
	{
		value: "unmonitor_show_delete_all_episodes",
		labelKey: "rules.actions.unmonitorShowDeleteAllEpisodes",
		mediaTypes: ["show"],
		granularities: ["show"],
	},
	{
		value: "unmonitor_show_keep_files",
		labelKey: "rules.actions.unmonitorShowKeepFiles",
		mediaTypes: ["show"],
		granularities: ["show"],
	},
	{
		value: "unmonitor_show_delete_existing_episodes",
		labelKey: "rules.actions.unmonitorShowDeleteExistingEpisodes",
		mediaTypes: ["show"],
		granularities: ["show"],
	},
	// Sonarr (show) actions, at the season level.
	{
		value: "season_unmonitor_delete_existing_episodes",
		labelKey: "rules.actions.seasonUnmonitorDeleteExistingEpisodes",
		mediaTypes: ["show"],
		granularities: ["season"],
	},
	{
		value: "season_unmonitor_delete_season",
		labelKey: "rules.actions.seasonUnmonitorDeleteSeason",
		mediaTypes: ["show"],
		granularities: ["season"],
	},
	{
		value: "season_unmonitor_delete_season_delete_show_if_empty",
		labelKey: "rules.actions.seasonUnmonitorDeleteSeasonDeleteShowIfEmpty",
		mediaTypes: ["show"],
		granularities: ["season"],
	},
	{
		value: "season_unmonitor_and_unmonitor_show_if_empty",
		labelKey: "rules.actions.seasonUnmonitorAndUnmonitorShowIfEmpty",
		mediaTypes: ["show"],
		granularities: ["season"],
	},
	{
		value: "season_unmonitor_keep_files",
		labelKey: "rules.actions.seasonUnmonitorKeepFiles",
		mediaTypes: ["show"],
		granularities: ["season"],
	},
	// Sonarr (show) actions, at the episode level.
	{
		value: "episode_unmonitor_delete_episode",
		labelKey: "rules.actions.episodeUnmonitorDeleteEpisode",
		mediaTypes: ["show"],
		granularities: ["episode"],
	},
	{
		value: "episode_unmonitor_keep_file",
		labelKey: "rules.actions.episodeUnmonitorKeepFile",
		mediaTypes: ["show"],
		granularities: ["episode"],
	},
];

// Options applicable to a library of the given media type ("movie",
// "show", ...) and, for show libraries, the given granularity
// (show/season/episode). Returns every option when mediaType is unknown
// (e.g. no library selected yet).
export function ruleActionOptionsFor(
	mediaType: string | undefined,
	granularity: RuleGranularity | undefined,
): RuleActionOption[] {
	if (mediaType === undefined) {
		return RULE_ACTION_OPTIONS;
	}
	return RULE_ACTION_OPTIONS.filter((o) => {
		if (o.mediaTypes !== undefined && !o.mediaTypes.includes(mediaType)) {
			return false;
		}
		if (mediaType !== "show" || o.granularities === undefined) {
			return true;
		}
		return granularity !== undefined && o.granularities.includes(granularity);
	});
}
