// Radarr's available cleanup actions (matches Maintainerr's option set).
// Namespaced under "radarr" implicitly for now since it's the only
// target — revisit if a non-Radarr action type is ever added.
export type RuleAction =
	| "change_quality_and_search"
	| "delete"
	| "do_nothing"
	| "unmonitor_and_delete_files"
	| "unmonitor_and_keep_files";

// For a show library only: whether the action applies at the season or
// episode level. Undefined for movie libraries, where the distinction
// doesn't apply.
export type RuleGranularity = "season" | "episode";

export type RuleDelayUnit = "hours" | "days" | "weeks" | "months";

// One entry in a rule's ordered action list, e.g. "unmonitor after 1 day".
export type RuleActionStep = {
	delayAmount: number;
	delayUnit: RuleDelayUnit;
	action: RuleAction;
};

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
};

export type RuleInput = {
	name: string;
	enabled: boolean;
	actions: RuleActionStep[];
	connectionId: number;
	libraryKey: string;
	granularity?: RuleGranularity;
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
