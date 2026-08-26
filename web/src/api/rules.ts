// Radarr's and Sonarr's available cleanup actions (matches Maintainerr's
// option sets). "change_quality_and_search" and "do_nothing" are shared
// across services/granularities since they mean the same thing everywhere;
// every other value is specific to one service and, for Sonarr, one
// granularity level (show/season/episode) — see ruleActions.ts for which.
export type RuleAction =
	| "change_quality_and_search"
	| "delete"
	| "do_nothing"
	| "unmonitor_and_delete_files"
	| "unmonitor_and_keep_files"
	| "delete_entire_show"
	| "unmonitor_show_delete_all_episodes"
	| "unmonitor_show_keep_files"
	| "unmonitor_show_delete_existing_episodes"
	| "season_unmonitor_delete_existing_episodes"
	| "season_unmonitor_delete_season"
	| "season_unmonitor_delete_season_delete_show_if_empty"
	| "season_unmonitor_and_unmonitor_show_if_empty"
	| "season_unmonitor_keep_files"
	| "episode_unmonitor_delete_episode"
	| "episode_unmonitor_keep_file";

// For a show library only: whether the action applies at the show,
// season, or episode level. Undefined for movie libraries, where the
// distinction doesn't apply.
export type RuleGranularity = "show" | "season" | "episode";

export type RuleDelayUnit = "hours" | "days" | "weeks" | "months";

// One entry in a rule's ordered action list, e.g. "unmonitor after 1 day".
export type RuleActionStep = {
	delayAmount: number;
	delayUnit: RuleDelayUnit;
	action: RuleAction;
};

// A condition leaf, e.g. { field: "plex.addedDate", operator: "olderThanDays", value: 30 }.
// The field/operator vocabulary lives in ruleCriteria.ts, not here — the
// backend only validates the tree shape, not these values.
export type RuleCriteriaCondition = {
	type: "condition";
	field: string;
	operator: string;
	value?: string | number | boolean;
};

// A group node — e.g. (A AND B) OR (C AND D) is a "group" with operator
// "OR" whose two children are themselves "group" nodes with operator
// "AND", each containing condition leaves.
export type RuleCriteriaGroup = {
	type: "group";
	operator: "AND" | "OR";
	children: RuleCriteriaNode[];
};

export type RuleCriteriaNode = RuleCriteriaGroup | RuleCriteriaCondition;

export type Rule = {
	id: number;
	name: string;
	enabled: boolean;
	actions: RuleActionStep[];
	// The library this rule scans, identified the same way the rest of the
	// app identifies a library (connection id + remote library key) rather
	// than through the Library entity, which nothing persists into yet.
	connectionId: number;
	libraryKey: string;
	granularity?: RuleGranularity;
	// Absent means "no criteria configured" — always a group node at the
	// root, even if it has just one child, so the UI always has an AND/OR
	// toggle to work with.
	criteria?: RuleCriteriaGroup;
};

export type RuleInput = {
	name: string;
	enabled: boolean;
	actions: RuleActionStep[];
	connectionId: number;
	libraryKey: string;
	granularity?: RuleGranularity;
	criteria?: RuleCriteriaGroup;
};

export async function fetchRules(): Promise<Rule[]> {
	const res = await fetch("/api/rules");
	if (!res.ok) {
		throw new Error("failed to load rules");
	}
	return res.json();
}

export async function createRule(input: RuleInput): Promise<Rule> {
	const res = await fetch("/api/rules", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to create rule");
	}
	return res.json();
}

export async function updateRule(id: number, input: RuleInput): Promise<Rule> {
	const res = await fetch(`/api/rules/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error("failed to update rule");
	}
	return res.json();
}

export async function deleteRule(id: number): Promise<void> {
	const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
	if (!res.ok) {
		throw new Error("failed to delete rule");
	}
}
