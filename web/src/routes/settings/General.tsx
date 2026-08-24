import { Select } from "@lib-managerr/ui";
import { LOCALE_NAMES, type Locale, useI18n } from "../../i18n/index.tsx";

const LOCALE_OPTIONS = (Object.keys(LOCALE_NAMES) as Locale[]).map(
	(locale) => ({
		value: locale,
		label: LOCALE_NAMES[locale],
	}),
);

function General() {
	const { t, locale, setLocale } = useI18n();

	return (
		<section>
			<h1>{t("settings.general.title")}</h1>
			<div class="mt-4 flex items-center gap-2">
				<label for="locale-select">{t("settings.general.locale")}</label>
				<Select
					id="locale-select"
					options={LOCALE_OPTIONS}
					value={locale()}
					onChange={(value) => setLocale(value as Locale)}
				/>
			</div>
		</section>
	);
}

export default General;
