import { Button, Modal } from "@lib-managerr/ui";
import { createResource, createSignal, For, Show } from "solid-js";
import {
	createRule,
	deleteRule,
	fetchRules,
	type Rule,
	updateRule,
} from "../api/rules.ts";
import { useI18n } from "../i18n/index.tsx";
import { RuleForm } from "./rules/RuleForm.tsx";
import { RULE_ACTION_OPTIONS } from "./rules/ruleActions.ts";

type ModalState = { mode: "add" } | { mode: "edit"; rule: Rule } | null;

function Rules() {
	const { t } = useI18n();
	const [rules, { refetch }] = createResource(fetchRules);
	const [modal, setModal] = createSignal<ModalState>(null);

	const closeModal = () => setModal(null);

	const handleSubmit = async (input: Parameters<typeof createRule>[0]) => {
		const current = modal();
		if (current?.mode === "edit") {
			await updateRule(current.rule.id, input);
		} else {
			await createRule(input);
		}
		await refetch();
		closeModal();
	};

	const handleDelete = async (rule: Rule) => {
		await deleteRule(rule.id);
		await refetch();
	};

	const actionLabel = (step: Rule["actions"][number]) => {
		const option = RULE_ACTION_OPTIONS.find((o) => o.value === step.action);
		return option ? t(option.labelKey) : step.action;
	};

	const actionsSummary = (rule: Rule) =>
		rule.actions.length === 0
			? t("rules.noActions")
			: rule.actions
					.map(
						(step) =>
							`${actionLabel(step)} (${step.delayAmount} ${t(`rules.delayUnits.${step.delayUnit}`)})`,
					)
					.join(", ");

	return (
		<section>
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-semibold">{t("rules.title")}</h1>
				<Button onClick={() => setModal({ mode: "add" })}>
					{t("rules.addButton")}
				</Button>
			</div>

			<Show
				when={(rules()?.length ?? 0) > 0}
				fallback={<p class="mt-4">{t("rules.empty")}</p>}
			>
				<ul class="mt-4 flex flex-col gap-2">
					<For each={rules()}>
						{(rule) => (
							<li class="flex items-center justify-between rounded border border-neutral-200 p-2 dark:border-neutral-800">
								<button
									type="button"
									class="flex-1 appearance-none text-left text-neutral-900 dark:text-neutral-50"
									onClick={() => setModal({ mode: "edit", rule })}
								>
									<div class="font-medium">{rule.name}</div>
									<div class="text-sm text-neutral-500 dark:text-neutral-400">
										{rule.enabled
											? t("rules.enabledLabel")
											: t("rules.disabledLabel")}
										{" · "}
										{actionsSummary(rule)}
									</div>
								</button>
								<Button variant="secondary" onClick={() => handleDelete(rule)}>
									{t("common.delete")}
								</Button>
							</li>
						)}
					</For>
				</ul>
			</Show>

			<Modal
				open={modal() !== null}
				title={
					modal()?.mode === "edit"
						? t("rules.modalTitleEdit")
						: t("rules.modalTitleAdd")
				}
				onClose={closeModal}
			>
				<Show when={modal()}>
					{(m) => {
						const current = m();
						return (
							<RuleForm
								mode={current.mode}
								rule={current.mode === "edit" ? current.rule : undefined}
								onSubmit={handleSubmit}
								onCancel={closeModal}
							/>
						);
					}}
				</Show>
			</Modal>
		</section>
	);
}

export default Rules;
