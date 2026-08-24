export type CheckboxProps = {
	id: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
};

export function Checkbox(props: CheckboxProps) {
	return (
		<div class="flex items-center gap-2">
			<input
				id={props.id}
				type="checkbox"
				checked={props.checked}
				disabled={props.disabled}
				onChange={(e) => props.onChange(e.currentTarget.checked)}
				class="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
			/>
			<label
				for={props.id}
				class="text-sm text-neutral-700 dark:text-neutral-300"
			>
				{props.label}
			</label>
		</div>
	);
}
