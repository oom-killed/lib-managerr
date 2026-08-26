import { Button, Checkbox, Select, TextField } from "@lib-managerr/ui";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import {
	type Connection,
	fetchConnectionLibraries,
	fetchConnections,
	LIBRARY_CAPABLE_CONNECTION_TYPES,
} from "../../api/connections.ts";
import type { Rule, RuleAction, RuleInput } from "../../api/rules.ts";
import { useI18n } from "../../i18n/index.tsx";
import { ruleActionOptionsFor } from "./ruleActions.ts";

export type RuleFormMode = "add" | "edit";

export type RuleFormProps = {
	mode: RuleFormMode;
	rule?: Rule;
	onSubmit: (input: RuleInput) => void | Promise<void>;
	onCancel: () => void;
};

export function RuleForm(props: RuleFormProps) {
	const { t } = useI18n();
	const [name, setName] = createSignal(props.rule?.name ?? "");
	const [enabled, setEnabled] = createSignal(props.rule?.enabled ?? true);
	const [action, setAction] = createSignal<RuleAction>(
		props.rule?.action ?? "do_nothing",
	);
	const [connectionId, setConnectionId] = createSignal<number | undefined>(
		props.rule?.connectionId,
	);
	const [libraryKey, setLibraryKey] = createSignal<string | undefined>(
		props.rule?.libraryKey,
	);
	const [submitting, setSubmitting] = createSignal(false);

	const [connections] = createResource(fetchConnections);
	const libraryConnections = () =>
		(connections() ?? []).filter((c) =>
			LIBRARY_CAPABLE_CONNECTION_TYPES.includes(c.type),
		);

	// Default to the first library-capable connection once the list loads,
	// unless editing a rule that already targets one.
	createEffect(() => {
		const list = libraryConnections();
		if (list.length > 0 && connectionId() === undefined) {
			setConnectionId(list[0].id);
		}
	});

	const [libraries] = createResource(connectionId, fetchConnectionLibraries);

	// Default to the first library once the list loads, unless editing a
	// rule that already targets one.
	createEffect(() => {
		const list = libraries();
		if (list && list.length > 0 && libraryKey() === undefined) {
			setLibraryKey(list[0].key);
		}
	});

	const connectionOptions = () =>
		libraryConnections().map((connection: Connection) => ({
			value: String(connection.id),
			label: connection.name,
		}));

	const libraryOptions = () =>
		(libraries() ?? []).map((library) => ({
			value: library.key,
			label: library.title,
		}));

	const selectedLibraryMediaType = () =>
		libraries()?.find((l) => l.key === libraryKey())?.type;

	const availableActionOptions = () =>
		ruleActionOptionsFor(selectedLibraryMediaType());

	// Reset to an action that's still valid whenever the selected library's
	// media type changes what's applicable (e.g. switching from a movie
	// library with action "delete" to a show library, where that Radarr
	// action doesn't apply).
	createEffect(() => {
		const available = availableActionOptions();
		if (!available.some((o) => o.value === action())) {
			setAction(available[0]?.value ?? "do_nothing");
		}
	});

	const canSave = () =>
		name().trim() !== "" &&
		connectionId() !== undefined &&
		libraryKey() !== undefined &&
		!submitting();

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!canSave()) {
			return;
		}
		setSubmitting(true);
		try {
			await props.onSubmit({
				name: name(),
				enabled: enabled(),
				action: action(),
				// biome-ignore lint/style/noNonNullAssertion: guarded by canSave()
				connectionId: connectionId()!,
				// biome-ignore lint/style/noNonNullAssertion: guarded by canSave()
				libraryKey: libraryKey()!,
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form class="flex flex-col gap-3" onSubmit={handleSubmit}>
			<TextField
				id="rule-name"
				label={t("rules.fields.name")}
				value={name()}
				required
				onChange={setName}
			/>
			<Checkbox
				id="rule-enabled"
				label={t("rules.fields.enabled")}
				checked={enabled()}
				onChange={setEnabled}
			/>
			<Show
				when={libraryConnections().length > 0}
				fallback={<p class="text-sm">{t("libraries.noConnections")}</p>}
			>
				<div class="flex flex-col gap-1">
					<label
						for="rule-connection"
						class="text-sm text-neutral-700 dark:text-neutral-300"
					>
						{t("rules.fields.connection")}
					</label>
					<Select
						id="rule-connection"
						options={connectionOptions()}
						value={String(connectionId() ?? "")}
						onChange={(value) => {
							setConnectionId(Number(value));
							setLibraryKey(undefined);
						}}
					/>
				</div>
				<div class="flex flex-col gap-1">
					<label
						for="rule-library"
						class="text-sm text-neutral-700 dark:text-neutral-300"
					>
						{t("rules.fields.library")}
					</label>
					<Select
						id="rule-library"
						options={libraryOptions()}
						value={libraryKey() ?? ""}
						onChange={setLibraryKey}
					/>
				</div>
			</Show>
			<div class="flex flex-col gap-1">
				<label
					for="rule-action"
					class="text-sm text-neutral-700 dark:text-neutral-300"
				>
					{t("rules.fields.action")}
				</label>
				<Select
					id="rule-action"
					options={availableActionOptions().map((o) => ({
						value: o.value,
						label: t(o.labelKey),
					}))}
					value={action()}
					onChange={(value) => setAction(value as RuleAction)}
				/>
			</div>

			<div class="mt-2 flex justify-end gap-2">
				<Button type="button" variant="secondary" onClick={props.onCancel}>
					{t("common.cancel")}
				</Button>
				<Button type="submit" disabled={!canSave()}>
					{t("common.save")}
				</Button>
			</div>
		</form>
	);
}
