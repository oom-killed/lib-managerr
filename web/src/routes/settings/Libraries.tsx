import { Button, Modal } from "@lib-managerr/ui";
import { createResource, createSignal, For, Show } from "solid-js";
import { useI18n } from "../../i18n/index.tsx";
import {
	type Connection,
	createConnection,
	fetchConnections,
} from "./libraries/api.ts";
import { ConnectionForm } from "./libraries/ConnectionForm.tsx";

type ModalState =
	| { mode: "add" }
	| { mode: "view"; connection: Connection }
	| null;

function Libraries() {
	const { t } = useI18n();
	const [connections, { refetch }] = createResource(fetchConnections);
	const [modal, setModal] = createSignal<ModalState>(null);

	const closeModal = () => setModal(null);

	const handleCreate = async (
		input: Parameters<typeof createConnection>[0],
	) => {
		await createConnection(input);
		await refetch();
		closeModal();
	};

	return (
		<section>
			<div class="flex items-center justify-between">
				<h1>{t("settings.libraries.title")}</h1>
				<Button onClick={() => setModal({ mode: "add" })}>
					{t("settings.libraries.addButton")}
				</Button>
			</div>

			<Show
				when={(connections()?.length ?? 0) > 0}
				fallback={<p class="mt-4">{t("settings.libraries.empty")}</p>}
			>
				<ul class="mt-4 flex flex-col gap-2">
					<For each={connections()}>
						{(connection) => (
							<li>
								<button
									type="button"
									class="w-full appearance-none rounded border border-neutral-200 p-2 text-left text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-900"
									onClick={() => setModal({ mode: "view", connection })}
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
					modal()?.mode === "view"
						? t("settings.libraries.modalTitleView")
						: t("settings.libraries.modalTitleAdd")
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
									current.mode === "view" ? current.connection : undefined
								}
								onSubmit={handleCreate}
								onCancel={closeModal}
							/>
						);
					}}
				</Show>
			</Modal>
		</section>
	);
}

export default Libraries;
