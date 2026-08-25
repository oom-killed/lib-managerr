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
		libraries: "Bibliothèques",
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
			"Aucune connexion configurée pour le moment. Ajoutez-en une dans Paramètres › Bibliothèques.",
		loadError: "Échec du chargement des bibliothèques de ce serveur.",
		noLibraries: "Aucune bibliothèque trouvée sur ce serveur.",
		itemsLoadError: "Échec du chargement des éléments de cette bibliothèque.",
		noItems: "Aucun élément dans cette bibliothèque.",
		pageRange: "{{start}}–{{end}} sur {{total}}",
	},
	settings: {
		general: {
			title: "Général",
			locale: "Langue",
		},
		libraries: {
			title: "Bibliothèques",
			addButton: "Ajouter une bibliothèque",
			empty: "Aucune bibliothèque connectée pour le moment.",
			modalTitleAdd: "Ajouter une bibliothèque",
			modalTitleEdit: "Modifier la bibliothèque",
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
			},
		},
	},
};
