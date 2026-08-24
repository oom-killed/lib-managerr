import { useI18n } from "../../i18n/index.tsx";

function Libraries() {
	const { t } = useI18n();

	return (
		<section>
			<h1>{t("settings.libraries.title")}</h1>
		</section>
	);
}

export default Libraries;
