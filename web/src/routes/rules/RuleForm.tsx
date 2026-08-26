import { Button, Checkbox, TextField } from "@lib-managerr/ui";
import { createSignal } from "solid-js";
import type { Rule, RuleInput } from "../../api/rules.ts";
import { useI18n } from "../../i18n/index.tsx";

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
	const [submitting, setSubmitting] = createSignal(false);

	const canSave = () => name().trim() !== "" && !submitting();

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!canSave()) {
			return;
		}
		setSubmitting(true);
		try {
			await props.onSubmit({ name: name(), enabled: enabled() });
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
