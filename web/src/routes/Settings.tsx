import { useI18n } from "../i18n/index.tsx";

function Settings() {
	const { t } = useI18n();

	return (
		<section>
			<h1>{t("settings.title")}</h1>
		</section>
	);
}

export default Settings;
