import type { Dict } from "./en.ts";

export const dict: Dict = {
	common: {
		save: "Enregistrer",
		cancel: "Annuler",
		close: "Fermer",
		previous: "Précédent",
		next: "Suivant",
		delete: "Supprimer",
	},
	nav: {
		dashboard: "Tableau de bord",
		libraries: "Bibliothèques",
		rules: "Règles",
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
		connectionsTitle: "Connexions",
		noConnections:
			"Aucune connexion configurée pour le moment. Ajoutez-en une dans Paramètres › Connexions.",
		statusOnline: "En ligne",
		statusOffline: "Hors ligne",
		statusChecking: "Vérification...",
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
		sonarrMonitored: "Surveillé",
		sonarrUnmonitored: "Non surveillé",
		sonarrNotTracked: "Absent de Sonarr",
	},
	rules: {
		title: "Règles",
		empty: "Aucune règle configurée pour le moment.",
		addButton: "Ajouter une règle",
		modalTitleAdd: "Ajouter une règle",
		modalTitleEdit: "Modifier la règle",
		enabledLabel: "Activée",
		disabledLabel: "Désactivée",
		noActions: "Aucune action",
		addAction: "Ajouter une action",
		fields: {
			name: "Nom",
			enabled: "Activée",
			action: "Action",
			connection: "Connexion",
			library: "Bibliothèque",
			granularity: "S'applique à",
			actions: "Actions",
			delayAmount: "Délai",
			delayUnit: "Unité",
		},
		actions: {
			changeQualityAndSearch: "Changer le profil de qualité et rechercher",
			delete: "Supprimer",
			doNothing: "Ne rien faire",
			unmonitorAndDeleteFiles: "Ne plus surveiller et supprimer les fichiers",
			unmonitorAndKeepFiles: "Ne plus surveiller et conserver les fichiers",
			deleteEntireShow: "Supprimer la série entière",
			unmonitorShowDeleteAllEpisodes:
				"Ne plus surveiller la série + les saisons, supprimer tous les épisodes",
			unmonitorShowKeepFiles:
				"Ne plus surveiller la série + les saisons, conserver les fichiers",
			unmonitorShowDeleteExistingEpisodes:
				"Ne plus surveiller la série, supprimer les épisodes existants",
			seasonUnmonitorDeleteExistingEpisodes:
				"Ne plus surveiller et supprimer les épisodes existants",
			seasonUnmonitorDeleteSeason: "Ne plus surveiller et supprimer la saison",
			seasonUnmonitorDeleteSeasonDeleteShowIfEmpty:
				"Ne plus surveiller et supprimer la saison + supprimer la série si vide",
			seasonUnmonitorAndUnmonitorShowIfEmpty:
				"Ne plus surveiller la saison + ne plus surveiller la série si vide",
			seasonUnmonitorKeepFiles:
				"Ne plus surveiller la saison et conserver les fichiers",
			episodeUnmonitorDeleteEpisode:
				"Ne plus surveiller et supprimer l'épisode",
			episodeUnmonitorKeepFile: "Ne plus surveiller et conserver le fichier",
		},
		granularity: {
			show: "Série",
			season: "Saisons",
			episode: "Épisodes",
		},
		delayUnits: {
			hours: "heures",
			days: "jours",
			weeks: "semaines",
			months: "mois",
		},
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
