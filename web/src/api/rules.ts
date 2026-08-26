export type Rule = {
	id: number;
	name: string;
	enabled: boolean;
};

export type RuleInput = {
	name: string;
	enabled: boolean;
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
