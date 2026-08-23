import * as i18n from "@solid-primitives/i18n";
import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { dict as en } from "./en.ts";
import { dict as fr } from "./fr.ts";

export type Locale = "en" | "fr";

const dictionaries = { en, fr } satisfies Record<Locale, typeof en>;

type Dictionary = i18n.Flatten<typeof en>;

type I18nContextValue = {
	locale: () => Locale;
	setLocale: (locale: Locale) => void;
	t: i18n.Translator<Dictionary>;
};

const I18nContext = createContext<I18nContextValue>();

export function I18nProvider(props: { children?: JSX.Element }) {
	const [locale, setLocale] = createSignal<Locale>("en");
	const flatDict = () => i18n.flatten(dictionaries[locale()]);
	const t = i18n.translator(flatDict, i18n.resolveTemplate);

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
