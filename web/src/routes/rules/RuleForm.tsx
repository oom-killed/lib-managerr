import { Button, Checkbox, Select, TextField } from "@lib-managerr/ui";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import {
	type Connection,
	fetchConnectionLibraries,
	fetchConnections,
	LIBRARY_CAPABLE_CONNECTION_TYPES,
} from "../../api/connections.ts";
import type {
	Rule,
	RuleActionStep,
	RuleDelayUnit,
	RuleGranularity,
	RuleInput,
} from "../../api/rules.ts";
import { useI18n } from "../../i18n/index.tsx";
import { ruleActionOptionsFor } from "./ruleActions.ts";

export type RuleFormMode = "add" | "edit";

export type RuleFormProps = {
	mode: RuleFormMode;
	rule?: Rule;
	onSubmit: (input: RuleInput) => void | Promise<void>;
	onCancel: () => void;
};

const DELAY_UNITS: RuleDelayUnit[] = ["hours", "days", "weeks", "months"];

function defaultStep(defaultAction: RuleActionStep["action"]): RuleActionStep {
	return { delayAmount: 1, delayUnit: "days", action: defaultAction };
}

export function RuleForm(props: RuleFormProps) {
	const { t } = useI18n();
	const [name, setName] = createSignal(props.rule?.name ?? "");
	const [enabled, setEnabled] = createSignal(props.rule?.enabled ?? true);
	const [actions, setActions] = createSignal<RuleActionStep[]>(
		props.rule?.actions && props.rule.actions.length > 0
			? props.rule.actions
			: [defaultStep("do_nothing")],
	);
	const [connectionId, setConnectionId] = createSignal<number | undefined>(
		props.rule?.connectionId,
	);
	const [libraryKey, setLibraryKey] = createSignal<string | undefined>(
		props.rule?.libraryKey,
	);
	const [granularity, setGranularity] = createSignal<
		RuleGranularity | undefined
	>(props.rule?.granularity);
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

	// Reset any step whose action is no longer valid whenever the selected
	// library's media type changes what's applicable (e.g. switching from a
	// movie library with action "delete" to a show library, where that
	// Radarr action doesn't apply).
	createEffect(() => {
		const available = availableActionOptions();
		setActions((prev) =>
			prev.map((step) =>
				available.some((o) => o.value === step.action)
					? step
					: { ...step, action: available[0]?.value ?? "do_nothing" },
			),
		);
	});

	const isShowLibrary = () => selectedLibraryMediaType() === "show";

	// Default to "season" once a show library is selected (unless a rule
	// already targeting a show library brought its own value); clear it
	// entirely when the library isn't a show library, since the
	// distinction is meaningless for movies.
	createEffect(() => {
		if (isShowLibrary()) {
			if (granularity() === undefined) {
				setGranularity("season");
			}
		} else if (granularity() !== undefined) {
			setGranularity(undefined);
		}
	});

	const updateStep = (index: number, patch: Partial<RuleActionStep>) => {
		setActions((prev) =>
			prev.map((step, i) => (i === index ? { ...step, ...patch } : step)),
		);
	};

	const addStep = () => {
		setActions((prev) => [
			...prev,
			defaultStep(availableActionOptions()[0]?.value ?? "do_nothing"),
		]);
	};

	const removeStep = (index: number) => {
		setActions((prev) => prev.filter((_, i) => i !== index));
	};

	const canSave = () =>
		name().trim() !== "" &&
		connectionId() !== undefined &&
		libraryKey() !== undefined &&
		(!isShowLibrary() || granularity() !== undefined) &&
		actions().length > 0 &&
		actions().every((step) => step.delayAmount > 0) &&
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
				actions: actions(),
				// biome-ignore lint/style/noNonNullAssertion: guarded by canSave()
				connectionId: connectionId()!,
				// biome-ignore lint/style/noNonNullAssertion: guarded by canSave()
				libraryKey: libraryKey()!,
				granularity: granularity(),
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
			<Show when={isShowLibrary()}>
				<div class="flex flex-col gap-1">
					<label
						for="rule-granularity"
						class="text-sm text-neutral-700 dark:text-neutral-300"
					>
						{t("rules.fields.granularity")}
					</label>
					<Select
						id="rule-granularity"
						options={[
							{ value: "season", label: t("rules.granularity.season") },
							{ value: "episode", label: t("rules.granularity.episode") },
						]}
						value={granularity() ?? "season"}
						onChange={(value) => setGranularity(value as RuleGranularity)}
					/>
				</div>
			</Show>

			<div class="flex flex-col gap-2">
				<span class="text-sm text-neutral-700 dark:text-neutral-300">
					{t("rules.fields.actions")}
				</span>
				<For each={actions()}>
					{(step, index) => (
						<div class="flex flex-col gap-2 rounded border border-neutral-200 p-2 dark:border-neutral-800">
							<div class="flex items-end gap-2">
								<div class="w-20">
									<TextField
										id={`rule-action-delay-${index()}`}
										label={t("rules.fields.delayAmount")}
										type="number"
										value={String(step.delayAmount)}
										onChange={(value) =>
											updateStep(index(), { delayAmount: Number(value) })
										}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label
										for={`rule-action-unit-${index()}`}
										class="text-sm text-neutral-700 dark:text-neutral-300"
									>
										{t("rules.fields.delayUnit")}
									</label>
									<Select
										id={`rule-action-unit-${index()}`}
										options={DELAY_UNITS.map((unit) => ({
											value: unit,
											label: t(`rules.delayUnits.${unit}`),
										}))}
										value={step.delayUnit}
										onChange={(value) =>
											updateStep(index(), { delayUnit: value as RuleDelayUnit })
										}
									/>
								</div>
							</div>
							<div class="flex flex-col gap-1">
								<label
									for={`rule-action-value-${index()}`}
									class="text-sm text-neutral-700 dark:text-neutral-300"
								>
									{t("rules.fields.action")}
								</label>
								<Select
									id={`rule-action-value-${index()}`}
									options={availableActionOptions().map((o) => ({
										value: o.value,
										label: t(o.labelKey),
									}))}
									value={step.action}
									onChange={(value) =>
										updateStep(index(), {
											action: value as RuleActionStep["action"],
										})
									}
								/>
							</div>
							<div class="flex justify-end">
								<Button
									type="button"
									variant="secondary"
									onClick={() => removeStep(index())}
								>
									{t("common.delete")}
								</Button>
							</div>
						</div>
					)}
				</For>
				<Button type="button" variant="secondary" onClick={addStep}>
					{t("rules.addAction")}
				</Button>
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
