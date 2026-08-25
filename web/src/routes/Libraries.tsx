import { Select } from "@lib-managerr/ui";
import { createEffect, createResource, Show } from "solid-js";
import {
	type Connection,
	fetchConnectionLibraries,
	fetchConnections,
} from "../api/connections.ts";
import { useI18n } from "../i18n/index.tsx";
import { useLibrarySelection } from "../state/librarySelection.tsx";

function Libraries() {
	const { t } = useI18n();
	const { connectionId, setConnectionId, libraryKey, setLibraryKey } =
		useLibrarySelection();
	const [connections] = createResource(fetchConnections);

	// Default to the first connection once the list loads.
	createEffect(() => {
		const list = connections();
		if (list && list.length > 0 && connectionId() === undefined) {
			setConnectionId(list[0].id);
		}
	});

	const [libraries] = createResource(connectionId, fetchConnectionLibraries);

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
					</Show>
				</div>
			</Show>
		</section>
	);
}

export default Libraries;
