import { For } from "solid-js";

export type SelectOption = {
	value: string;
	label: string;
};

export type SelectProps = {
	id?: string;
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	"aria-label"?: string;
};

export function Select(props: SelectProps) {
	return (
		<select
			id={props.id}
			class="rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
			value={props.value}
			aria-label={props["aria-label"]}
			onChange={(e) => props.onChange(e.currentTarget.value)}
		>
			<For each={props.options}>
				{(option) => <option value={option.value}>{option.label}</option>}
			</For>
		</select>
	);
}
