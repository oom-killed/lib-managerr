import { Button, Modal } from "@lib-managerr/ui";
import { createResource, createSignal, For, Show } from "solid-js";
import {
	type Connection,
	createConnection,
	fetchConnections,
	updateConnection,
} from "../../api/connections.ts";
import { useI18n } from "../../i18n/index.tsx";
import { ConnectionForm } from "./connections/ConnectionForm.tsx";

type ModalState =
	| { mode: "add" }
	| { mode: "edit"; connection: Connection }
	| null;

function Connections() {
	const { t } = useI18n();
	const [connections, { refetch }] = createResource(fetchConnections);
	const [modal, setModal] = createSignal<ModalState>(null);

	const closeModal = () => setModal(null);

	const handleSubmit = async (
		input: Parameters<typeof createConnection>[0],
	) => {
		const current = modal();
		if (current?.mode === "edit") {
			await updateConnection(current.connection.id, input);
		} else {
			await createConnection(input);
		}
		await refetch();
		closeModal();
	};

	return (
		<section>
			<div class="flex items-center justify-between">
				<h1>{t("settings.connections.title")}</h1>
				<Button onClick={() => setModal({ mode: "add" })}>
					{t("settings.connections.addButton")}
				</Button>
			</div>

			<Show
				when={(connections()?.length ?? 0) > 0}
				fallback={<p class="mt-4">{t("settings.connections.empty")}</p>}
			>
				<ul class="mt-4 flex flex-col gap-2">
					<For each={connections()}>
						{(connection) => (
							<li>
								<button
									type="button"
									class="w-full appearance-none rounded border border-neutral-200 p-2 text-left text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-900"
									onClick={() => setModal({ mode: "edit", connection })}
								>
									<div class="font-medium">{connection.name}</div>
									<div class="text-sm text-neutral-500 dark:text-neutral-400">
										{connection.host}
									</div>
								</button>
							</li>
						)}
					</For>
				</ul>
			</Show>

			<Modal
				open={modal() !== null}
				title={
					modal()?.mode === "edit"
						? t("settings.connections.modalTitleEdit")
						: t("settings.connections.modalTitleAdd")
				}
				onClose={closeModal}
			>
				<Show when={modal()}>
					{(m) => {
						const current = m();
						return (
							<ConnectionForm
								mode={current.mode}
								connection={
									current.mode === "edit" ? current.connection : undefined
								}
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

export default Connections;
