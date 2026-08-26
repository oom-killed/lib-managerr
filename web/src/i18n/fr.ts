import type { Dict } from "./en.ts";

export const dict: Dict = {
	common: {
		save: "Enregistrer",
		cancel: "Annuler",
		close: "Fermer",
		previous: "Précédent",
		next: "Suivant",
	},
	nav: {
		dashboard: "Tableau de bord",
		libraries: "Bibliothèques",
		settings: "Paramètres",
	},
	settingsNav: {
		general: "Général",
		connections: "Connexions",
	},
	dashboard: {
		title: "Tableau de bord",
		backendStatus: "état du serveur : {{status}}",
		checking: "vérification...",
	},
	libraries: {
		title: "Bibliothèques",
		connectionLabel: "Connexion",
		libraryLabel: "Bibliothèque",
		noConnections:
			"Aucune connexion Plex configurée pour le moment. Ajoutez-en une dans Paramètres › Connexions.",
		loadError: "Échec du chargement des bibliothèques de ce serveur.",
		noLibraries: "Aucune bibliothèque trouvée sur ce serveur.",
		itemsLoadError: "Échec du chargement des éléments de cette bibliothèque.",
		noItems: "Aucun élément dans cette bibliothèque.",
		pageRange: "{{start}}–{{end}} sur {{total}}",
		showMeta: "{{seasons}} saisons, {{episodes}} épisodes",
		radarrMonitored: "Surveillé",
		radarrUnmonitored: "Non surveillé",
		radarrNotTracked: "Absent de Radarr",
	},
	settings: {
		general: {
			title: "Général",
			locale: "Langue",
		},
		connections: {
			title: "Connexions",
			addButton: "Ajouter une connexion",
			empty: "Aucune connexion configurée pour le moment.",
			modalTitleAdd: "Ajouter une connexion",
			modalTitleEdit: "Modifier la connexion",
			tokenEditHint: "Laisser vide pour conserver le jeton actuel",
			testButton: "Tester la connexion",
			testing: "Test en cours...",
			testSuccess: "Connexion réussie",
			testFailure: "Échec de la connexion : {{error}}",
			fields: {
				name: "Nom",
				host: "Hôte",
				port: "Port",
				ssl: "Utiliser SSL",
				token: "Jeton",
				apiKey: "Clé API",
			},
		},
	},
};
