import { Button, Select, TextField } from "@lib-managerr/ui";
import { For, Match, Show, Switch } from "solid-js";
import type {
	RuleCriteriaCondition,
	RuleCriteriaGroup,
	RuleCriteriaNode,
} from "../../api/rules.ts";
import { useI18n } from "../../i18n/index.tsx";
import {
	type CriteriaField,
	criteriaFieldsFor,
	findCriteriaField,
} from "./ruleCriteria.ts";

function defaultCondition(
	mediaType: string | undefined,
): RuleCriteriaCondition {
	const field = criteriaFieldsFor(mediaType)[0];
	return {
		type: "condition",
		field: field.id,
		operator: field.operators[0].id,
		value: field.valueKind === "boolean" ? "true" : "",
	};
}

export function defaultGroup(mediaType: string | undefined): RuleCriteriaGroup {
	return {
		type: "group",
		operator: "AND",
		children: [defaultCondition(mediaType)],
	};
}

type ConditionRowProps = {
	condition: RuleCriteriaCondition;
	mediaType: string | undefined;
	onChange: (next: RuleCriteriaCondition) => void;
	onRemove: () => void;
};

function ConditionRow(props: ConditionRowProps) {
	const { t } = useI18n();

	const field = () =>
		findCriteriaField(props.condition.field) ??
		criteriaFieldsFor(props.mediaType)[0];
	const operator = () =>
		field().operators.find((o) => o.id === props.condition.operator) ??
		field().operators[0];

	const handleFieldChange = (fieldId: string) => {
		const next = criteriaFieldsFor(props.mediaType).find(
			(f) => f.id === fieldId,
		);
		if (!next) {
			return;
		}
		props.onChange({
			type: "condition",
			field: next.id,
			operator: next.operators[0].id,
			value: next.valueKind === "boolean" ? "true" : "",
		});
	};

	const handleOperatorChange = (operatorId: string) => {
		props.onChange({ ...props.condition, operator: operatorId });
	};

	const handleValueChange = (value: string) => {
		props.onChange({ ...props.condition, value });
	};

	const isDateRangeOperator = () =>
		field().valueKind === "date" &&
		(operator().id === "before" || operator().id === "after");
	const isDayCountOperator = () =>
		field().valueKind === "date" &&
		(operator().id === "olderThanDays" || operator().id === "newerThanDays");

	return (
		<div class="flex flex-wrap items-end gap-2">
			<div class="flex flex-col gap-1">
				<label
					for={`criteria-field-${props.condition.field}`}
					class="text-sm text-neutral-700 dark:text-neutral-300"
				>
					{t("rules.fields.criteriaField")}
				</label>
				<Select
					id={`criteria-field-${props.condition.field}`}
					options={criteriaFieldsFor(props.mediaType).map(
						(f: CriteriaField) => ({
							value: f.id,
							label: t(f.labelKey),
						}),
					)}
					value={field().id}
					onChange={handleFieldChange}
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label
					for={`criteria-operator-${props.condition.field}`}
					class="text-sm text-neutral-700 dark:text-neutral-300"
				>
					{t("rules.fields.criteriaOperator")}
				</label>
				<Select
					id={`criteria-operator-${props.condition.field}`}
					options={field().operators.map((o) => ({
						value: o.id,
						label: t(o.labelKey),
					}))}
					value={operator().id}
					onChange={handleOperatorChange}
				/>
			</div>
			<Show when={operator().needsValue}>
				<Show
					when={field().valueKind === "boolean"}
					fallback={
						<TextField
							id={`criteria-value-${props.condition.field}`}
							label={t("rules.fields.criteriaValue")}
							type={
								field().valueKind === "number" || isDayCountOperator()
									? "number"
									: "text"
							}
							placeholder={isDateRangeOperator() ? "YYYY-MM-DD" : undefined}
							value={String(props.condition.value ?? "")}
							onChange={handleValueChange}
						/>
					}
				>
					<div class="flex flex-col gap-1">
						<label
							for={`criteria-value-${props.condition.field}`}
							class="text-sm text-neutral-700 dark:text-neutral-300"
						>
							{t("rules.fields.criteriaValue")}
						</label>
						<Select
							id={`criteria-value-${props.condition.field}`}
							options={[
								{ value: "true", label: t("common.yes") },
								{ value: "false", label: t("common.no") },
							]}
							value={String(props.condition.value ?? "true")}
							onChange={handleValueChange}
						/>
					</div>
				</Show>
			</Show>
			<Button type="button" variant="secondary" onClick={props.onRemove}>
				{t("common.delete")}
			</Button>
		</div>
	);
}

export type CriteriaGroupEditorProps = {
	group: RuleCriteriaGroup;
	mediaType: string | undefined;
	onChange: (next: RuleCriteriaGroup) => void;
	onRemove: () => void;
};

export function CriteriaGroupEditor(props: CriteriaGroupEditorProps) {
	const { t } = useI18n();

	const updateChild = (index: number, next: RuleCriteriaNode) => {
		props.onChange({
			...props.group,
			children: props.group.children.map((c, i) => (i === index ? next : c)),
		});
	};

	const removeChild = (index: number) => {
		const children = props.group.children.filter((_, i) => i !== index);
		if (children.length === 0) {
			props.onRemove();
			return;
		}
		props.onChange({ ...props.group, children });
	};

	const addCondition = () => {
		props.onChange({
			...props.group,
			children: [...props.group.children, defaultCondition(props.mediaType)],
		});
	};

	const addGroup = () => {
		props.onChange({
			...props.group,
			children: [...props.group.children, defaultGroup(props.mediaType)],
		});
	};

	return (
		<div class="flex flex-col gap-2 rounded border border-neutral-200 p-2 dark:border-neutral-800">
			<div class="flex items-center gap-2">
				<Select
					options={[
						{ value: "AND", label: t("rules.criteriaOperatorLogic.and") },
						{ value: "OR", label: t("rules.criteriaOperatorLogic.or") },
					]}
					value={props.group.operator}
					onChange={(value) =>
						props.onChange({ ...props.group, operator: value as "AND" | "OR" })
					}
				/>
				<Button type="button" variant="secondary" onClick={props.onRemove}>
					{t("common.delete")}
				</Button>
			</div>
			<For each={props.group.children}>
				{(child, index) => (
					<Switch>
						<Match when={child.type === "condition"}>
							<ConditionRow
								condition={child as RuleCriteriaCondition}
								mediaType={props.mediaType}
								onChange={(next) => updateChild(index(), next)}
								onRemove={() => removeChild(index())}
							/>
						</Match>
						<Match when={child.type === "group"}>
							<CriteriaGroupEditor
								group={child as RuleCriteriaGroup}
								mediaType={props.mediaType}
								onChange={(next) => updateChild(index(), next)}
								onRemove={() => removeChild(index())}
							/>
						</Match>
					</Switch>
				)}
			</For>
			<div class="flex gap-2">
				<Button type="button" variant="secondary" onClick={addCondition}>
					{t("rules.addCondition")}
				</Button>
				<Button type="button" variant="secondary" onClick={addGroup}>
					{t("rules.addGroup")}
				</Button>
			</div>
		</div>
	);
}
