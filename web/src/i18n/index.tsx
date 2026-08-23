import * as i18n from "@solid-primitives/i18n";
import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { dict as en } from "./en.ts";
import { dict as fr } from "./fr.ts";

export type Locale = "en" | "fr";

const dictionaries = { en, fr } satisfies Record<Locale, typeof en>;

// Native names, shown regardless of the active locale — not translated.
export const LOCALE_NAMES: Record<Locale, string> = {
	en: "English",
	fr: "Français",
};

type Dictionary = i18n.Flatten<typeof en>;

type I18nContextValue = {
	locale: () => Locale;
	setLocale: (locale: Locale) => void;
	t: i18n.Translator<Dictionary>;
};

const I18nContext = createContext<I18nContextValue>();

const STORAGE_KEY = "lib-managerr:locale";

function isLocale(value: string): value is Locale {
	return value in dictionaries;
}

function readStoredLocale(): Locale | null {
	const value = sessionStorage.getItem(STORAGE_KEY);
	return value !== null && isLocale(value) ? value : null;
}

export function I18nProvider(props: { children?: JSX.Element }) {
	const [locale, setLocaleSignal] = createSignal<Locale>(
		readStoredLocale() ?? "en",
	);
	const flatDict = () => i18n.flatten(dictionaries[locale()]);
	const t = i18n.translator(flatDict, i18n.resolveTemplate);

	const setLocale = (next: Locale) => {
		setLocaleSignal(next);
		sessionStorage.setItem(STORAGE_KEY, next);
	};

	return (
		<I18nContext.Provider value={{ locale, setLocale, t }}>
			{props.children}
		</I18nContext.Provider>
	);
}

export function useI18n(): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return ctx;
}
