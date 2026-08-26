import { useI18n } from "../i18n/index.tsx";

function Rules() {
	const { t } = useI18n();

	return (
		<section>
			<h1 class="text-xl font-semibold">{t("rules.title")}</h1>
			<p>{t("rules.empty")}</p>
		</section>
	);
}

export default Rules;
