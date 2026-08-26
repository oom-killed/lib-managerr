import { Button, Checkbox, Select, TextField } from "@lib-managerr/ui";
import { createSignal, For, Show } from "solid-js";
import type {
	Connection,
	ConnectionInput,
	TestConnectionResult,
} from "../../../api/connections.ts";
import {
	testConnection,
	testExistingConnection,
} from "../../../api/connections.ts";
import { useI18n } from "../../../i18n/index.tsx";
import {
	CONNECTION_TYPE_FIELDS,
	CONNECTION_TYPE_OPTIONS,
	type ConnectionFieldKey,
	type ConnectionType,
} from "./connectionTypes.ts";

export type ConnectionFormMode = "add" | "edit";

type FieldValue = string | boolean;

type FormState = {
	type: ConnectionType;
	name: string;
	host: string;
	port: string;
	ssl: boolean;
	token: string;
};

function toFormState(connection?: Connection): FormState {
	return {
		type: connection?.type ?? CONNECTION_TYPE_OPTIONS[0].value,
		name: connection?.name ?? "",
		host: connection?.host ?? "",
		port: connection ? String(connection.port) : "",
		ssl: connection?.ssl ?? false,
		token: "",
	};
}

function getFieldValue(state: FormState, key: ConnectionFieldKey): FieldValue {
	return state[key];
}

function setFieldValue(
	setState: (updater: (prev: FormState) => FormState) => void,
	key: ConnectionFieldKey,
	value: FieldValue,
) {
	setState((prev) => ({ ...prev, [key]: value }) as FormState);
}

export type ConnectionFormProps = {
	mode: ConnectionFormMode;
	connection?: Connection;
	onSubmit: (input: ConnectionInput) => void | Promise<void>;
	onCancel: () => void;
};

export function ConnectionForm(props: ConnectionFormProps) {
	const { t } = useI18n();
	const initialState = toFormState(props.connection);
	const [state, setState] = createSignal(initialState);
	const [submitting, setSubmitting] = createSignal(false);
	const [testing, setTesting] = createSignal(false);
	const [testResult, setTestResult] = createSignal<TestConnectionResult | null>(
		null,
	);

	const isAdd = () => props.mode === "add";
	const isDirty = () =>
		isAdd() || JSON.stringify(state()) !== JSON.stringify(initialState);
	const canSave = () => isDirty() && !submitting();
	// host + port + (token, but only when adding — an existing connection
	// can fall back to its stored token) are the minimum needed to attempt
	// a connection, regardless of connection type.
	const canTest = () =>
		state().host.trim() !== "" &&
		Number(state().port) > 0 &&
		(isAdd() ? state().token.trim() !== "" : true) &&
		!testing();

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!canSave()) {
			return;
		}
		setSubmitting(true);
		try {
			await props.onSubmit({
				type: state().type,
				name: state().name,
				host: state().host,
				port: Number(state().port),
				ssl: state().ssl,
				token: state().token,
			});
		} finally {
			setSubmitting(false);
		}
	};

	const handleTest = async () => {
		setTesting(true);
		setTestResult(null);
		try {
			const input = {
				type: state().type,
				host: state().host,
				port: Number(state().port),
				ssl: state().ssl,
				token: state().token,
			};
			const result =
				!isAdd() && props.connection
					? await testExistingConnection(props.connection.id, input)
					: await testConnection(input);
			setTestResult(result);
		} catch {
			setTestResult({ ok: false, error: "network error" });
		} finally {
			setTesting(false);
		}
	};

	return (
		<form class="flex flex-col gap-3" onSubmit={handleSubmit}>
			<Show when={isAdd() && CONNECTION_TYPE_OPTIONS.length > 1}>
				<Select
					id="connection-type"
					options={CONNECTION_TYPE_OPTIONS}
					value={state().type}
					onChange={(value) =>
						setState((prev) => ({ ...prev, type: value as ConnectionType }))
					}
				/>
			</Show>
			<For each={CONNECTION_TYPE_FIELDS[state().type]}>
				{(field) => (
					<Show
						when={field.kind === "checkbox"}
						fallback={
							<TextField
								id={field.key}
								label={t(field.labelKey)}
								type={field.kind === "checkbox" ? "text" : field.kind}
								value={String(getFieldValue(state(), field.key))}
								required={field.key === "token" ? isAdd() : true}
								placeholder={
									field.key === "token" && !isAdd()
										? t("settings.connections.tokenEditHint")
										: undefined
								}
								onChange={(value) => {
									setFieldValue(setState, field.key, value);
									setTestResult(null);
								}}
							/>
						}
					>
						<Checkbox
							id={field.key}
							label={t(field.labelKey)}
							checked={Boolean(getFieldValue(state(), field.key))}
							onChange={(checked) => {
								setFieldValue(setState, field.key, checked);
								setTestResult(null);
							}}
						/>
					</Show>
				)}
			</For>

			<div class="flex items-center gap-2">
				<Button
					type="button"
					variant="secondary"
					disabled={!canTest()}
					onClick={handleTest}
				>
					{testing()
						? t("settings.connections.testing")
						: t("settings.connections.testButton")}
				</Button>
				<Show when={testResult()}>
					{(result) => (
						<span
							class="text-sm"
							classList={{
								"text-green-600 dark:text-green-400": result().ok,
								"text-red-600 dark:text-red-400": !result().ok,
							}}
						>
							{result().ok
								? t("settings.connections.testSuccess")
								: t("settings.connections.testFailure", {
										error: result().error ?? "",
									})}
						</span>
					)}
				</Show>
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
