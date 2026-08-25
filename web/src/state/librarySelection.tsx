// Shared "current connection/library" selection, readable/writable from
// anywhere via useLibrarySelection() — no prop-drilling. Same signal +
// context pattern as i18n/index.tsx's I18nProvider.

import { createContext, createSignal, type JSX, useContext } from "solid-js";

type LibrarySelectionContextValue = {
	connectionId: () => number | undefined;
	setConnectionId: (id: number | undefined) => void;
	libraryKey: () => string | undefined;
	setLibraryKey: (key: string | undefined) => void;
};

const LibrarySelectionContext = createContext<LibrarySelectionContextValue>();

export function LibrarySelectionProvider(props: { children?: JSX.Element }) {
	const [connectionId, setConnectionIdSignal] = createSignal<
		number | undefined
	>(undefined);
	const [libraryKey, setLibraryKey] = createSignal<string | undefined>(
		undefined,
	);

	// A library key only makes sense for the connection it came from, so
	// changing connection always clears it — a domain rule, not a
	// per-caller UI concern.
	const setConnectionId = (id: number | undefined) => {
		setConnectionIdSignal(id);
		setLibraryKey(undefined);
	};

	return (
		<LibrarySelectionContext.Provider
			value={{ connectionId, setConnectionId, libraryKey, setLibraryKey }}
		>
			{props.children}
		</LibrarySelectionContext.Provider>
	);
}

export function useLibrarySelection(): LibrarySelectionContextValue {
	const ctx = useContext(LibrarySelectionContext);
	if (!ctx) {
		throw new Error(
			"useLibrarySelection must be used within a LibrarySelectionProvider",
		);
	}
	return ctx;
}
