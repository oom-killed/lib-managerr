import { Button, Select } from "@lib-managerr/ui";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import {
	type Connection,
	fetchConnectionLibraries,
	fetchConnections,
	fetchLibraryItems,
} from "../api/connections.ts";
import { useI18n } from "../i18n/index.tsx";
import { useLibrarySelection } from "../state/librarySelection.tsx";

const PAGE_SIZE = 20;

function Libraries() {
	const { t } = useI18n();
	const { connectionId, setConnectionId, libraryKey, setLibraryKey } =
		useLibrarySelection();
	const [connections] = createResource(fetchConnections);
	const [offset, setOffset] = createSignal(0);

	// Default to the first connection once the list loads.
	createEffect(() => {
		const list = connections();
		if (list && list.length > 0 && connectionId() === undefined) {
			setConnectionId(list[0].id);
		}
	});

	const [libraries] = createResource(connectionId, fetchConnectionLibraries);

	// Default to the first library once the list loads.
	createEffect(() => {
		const list = libraries();
		if (list && list.length > 0 && libraryKey() === undefined) {
			setLibraryKey(list[0].key);
		}
	});

	// Reset to the first page whenever the selected library changes.
	createEffect(() => {
		libraryKey();
		setOffset(0);
	});

	const itemsSource = () => {
		const id = connectionId();
		const key = libraryKey();
		if (id === undefined || key === undefined) {
			return undefined;
		}
		return {
			connectionId: id,
			libraryKey: key,
			offset: offset(),
			limit: PAGE_SIZE,
		};
	};

	const [items] = createResource(itemsSource, fetchLibraryItems);

	const connectionOptions = () =>
		(connections() ?? []).map((connection: Connection) => ({
			value: String(connection.id),
			label: connection.name,
		}));

	const libraryOptions = () =>
		(libraries() ?? []).map((library) => ({
			value: library.key,
			label: library.title,
		}));

	return (
		<section>
			<h1>{t("libraries.title")}</h1>

			<Show
				when={(connections()?.length ?? 0) > 0}
				fallback={<p class="mt-4">{t("libraries.noConnections")}</p>}
			>
				<div class="mt-4 flex flex-col gap-3">
					<div class="flex items-center gap-2">
						<label for="connection-select">
							{t("libraries.connectionLabel")}
						</label>
						<Select
							id="connection-select"
							options={connectionOptions()}
							value={String(connectionId() ?? "")}
							onChange={(value) => setConnectionId(Number(value))}
						/>
					</div>

					<Show when={libraries.error}>
						<p class="text-red-600 dark:text-red-400">
							{t("libraries.loadError")}
						</p>
					</Show>

					<Show
						when={
							!libraries.error &&
							!libraries.loading &&
							libraryOptions().length === 0
						}
					>
						<p>{t("libraries.noLibraries")}</p>
					</Show>

					<Show when={libraryOptions().length > 0}>
						<div class="flex items-center gap-2">
							<label for="library-select">{t("libraries.libraryLabel")}</label>
							<Select
								id="library-select"
								options={libraryOptions()}
								value={libraryKey() ?? libraryOptions()[0]?.value ?? ""}
								onChange={setLibraryKey}
							/>
						</div>

						<Show when={items.error}>
							<p class="text-red-600 dark:text-red-400">
								{t("libraries.itemsLoadError")}
							</p>
						</Show>

						<Show
							when={
								!items.error &&
								!items.loading &&
								(items()?.items.length ?? 0) === 0
							}
						>
							<p>{t("libraries.noItems")}</p>
						</Show>

						<Show when={(items()?.items.length ?? 0) > 0}>
							<ul class="flex flex-col gap-1">
								<For each={items()?.items}>
									{(item) => (
										<li class="rounded border border-neutral-200 p-2 dark:border-neutral-800">
											<span class="font-medium">{item.title}</span>
											<Show when={item.year}>
												<span class="ml-1 text-sm text-neutral-500 dark:text-neutral-400">
													({item.year})
												</span>
											</Show>
										</li>
									)}
								</For>
							</ul>

							<div class="flex items-center gap-2">
								<Button
									variant="secondary"
									disabled={offset() === 0}
									onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
								>
									{t("common.previous")}
								</Button>
								<span class="text-sm">
									{t("libraries.pageRange", {
										start: offset() + 1,
										end: Math.min(offset() + PAGE_SIZE, items()?.total ?? 0),
										total: items()?.total ?? 0,
									})}
								</span>
								<Button
									variant="secondary"
									disabled={offset() + PAGE_SIZE >= (items()?.total ?? 0)}
									onClick={() => setOffset((o) => o + PAGE_SIZE)}
								>
									{t("common.next")}
								</Button>
							</div>
						</Show>
					</Show>
				</div>
			</Show>
		</section>
	);
}

export default Libraries;
