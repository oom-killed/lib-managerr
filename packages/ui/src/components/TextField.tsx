export type TextFieldProps = {
	id: string;
	label: string;
	type?: "text" | "number" | "password";
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	required?: boolean;
};

export function TextField(props: TextFieldProps) {
	return (
		<div class="flex flex-col gap-1">
			<label
				for={props.id}
				class="text-sm text-neutral-700 dark:text-neutral-300"
			>
				{props.label}
			</label>
			<input
				id={props.id}
				type={props.type ?? "text"}
				value={props.value}
				disabled={props.disabled}
				required={props.required}
				onInput={(e) => props.onChange(e.currentTarget.value)}
				class="rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
			/>
		</div>
	);
}
