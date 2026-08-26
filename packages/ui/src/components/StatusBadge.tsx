export type StatusBadgeStatus = "online" | "offline" | "checking";

export type StatusBadgeProps = {
	status: StatusBadgeStatus;
	label: string;
};

const DOT_COLOR: Record<StatusBadgeStatus, string> = {
	online: "bg-green-500",
	offline: "bg-red-500",
	checking: "bg-neutral-400 dark:bg-neutral-500",
};

export function StatusBadge(props: StatusBadgeProps) {
	return (
		<span class="inline-flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
			<span
				class={`h-2 w-2 rounded-full ${DOT_COLOR[props.status]}`}
				aria-hidden="true"
			/>
			{props.label}
		</span>
	);
}
