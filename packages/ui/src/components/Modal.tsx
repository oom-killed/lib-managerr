import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Portal } from "solid-js/web";

export type ModalProps = {
	open: boolean;
	title: string;
	onClose: () => void;
	children?: JSX.Element;
};

export function Modal(props: ModalProps) {
	return (
		<Show when={props.open}>
			<Portal>
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div class="w-full max-w-md rounded bg-white p-4 shadow-lg dark:bg-neutral-900">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
								{props.title}
							</h2>
							<button
								type="button"
								aria-label="Close"
								onClick={props.onClose}
								class="appearance-none text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
							>
								×
							</button>
						</div>
						{props.children}
					</div>
				</div>
			</Portal>
		</Show>
	);
}
