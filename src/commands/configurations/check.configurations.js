const { messageSlowModeInterval, messageDeletionInterval, officers, channels, categories, roles } = require('../../../config.json');

async function handle(client) {
	let errors = [];

	if (!messageSlowModeInterval || isNaN(messageDeletionInterval)) {
		errors.push("La clé de configuration 'messageSlowModeInterval' doit être un nombre. Elle correspond à l'intervale (en secondes) du slow-mode dans les channels des événements.");
	}

	if (!messageDeletionInterval || isNaN(messageDeletionInterval)) {
		errors.push("La clé de configuration 'messageDeletionInterval' doit être un nombre. Elle correspond à l'intervale (en secondes) avant la suppression d'une commande.");
	}

	if (!officers) {
		errors.push("Le noeud de configuration 'officers' n'existe pas.");
	}
	else if (!officers.idRole || officers.idRole.length === 0) {
		errors.push("La clé de configuration 'officers'/'idRole' n'est pas renseignée. Elle correspond à l'identifiant du rôle officers.");
	}

	if (!categories) {
		errors.push("Le noeud de configuration 'categories' n'existe pas.");
	}
	else if (!categories.events || categories.events.length === 0) {
		errors.push("La clé de configuration 'categories'/'wars' n'est pas renseignée. Elle correspond à l'identifiant de la catégorie pour les inscriptions aux événements.");
	}

	if (!channels) {
		errors.push("Le noeud de configuration 'channels' n'existe pas.");
	}
	else {
		if (!channels.roles || channels.roles.length === 0) {
			errors.push("La clé de configuration 'channels'/'roles' n'est pas renseignée. Elle correspond à l'identifiant du channel pour rejoindre un rôle.");
		}
		if (!channels.config || channels.config.length === 0) {
			errors.push("La clé de configuration 'channels'/'config' n'est pas renseignée. Elle correspond à l'identifiant du channel pour la configuration.");
		}
	}

	if (!roles) {
		errors.push("Le noeud de configuration 'roles' n'existe pas.");
	}
	else {
		if (!roles.dps) {
			errors.push("Le noeud de configuration 'roles'/'dps' n'existe pas.");
		}
		else {
			if (!roles.dps.id || roles.dps.id.length === 0) {
				errors.push("La clé de configuration 'roles'/'dps'/'id' n'est pas renseignée. Elle correspond à l'identifiant du rôle 'dps'.");
			}
			if (!roles.dps.idEmoji || roles.dps.idEmoji.length === 0) {
				errors.push("La clé de configuration 'roles'/'dps'/'idEmoji' n'est pas renseignée. Elle correspond à l'identifiant de l'emoji associé au rôle 'dps'.");
			}
		}

		if (!roles.heal) {
			errors.push("Le noeud de configuration 'roles'/'dps' n'existe pas.");
		}
		else {
			if (!roles.heal.id || roles.heal.id.length === 0) {
				errors.push("La clé de configuration 'roles'/'heal'/'id' n'est pas renseignée. Elle correspond à l'identifiant du rôle 'heal'.");
			}
			if (!roles.heal.idEmoji || roles.heal.idEmoji.length === 0) {
				errors.push("La clé de configuration 'roles'/'heal'/'idEmoji' n'est pas renseignée. Elle correspond à l'identifiant de l'emoji associé au rôle 'heal'.");
			}
		}

		if (!roles.tank) {
			errors.push("Le noeud de configuration 'roles'/'dps' n'existe pas.");
		}
		else {
			if (!roles.tank.id || roles.tank.id.length === 0) {
				errors.push("La clé de configuration 'roles'/'tank'/'id' n'est pas renseignée. Elle correspond à l'identifiant du rôle 'tank'.");
			}
			if (!roles.tank.idEmoji || roles.tank.idEmoji.length === 0) {
				errors.push("La clé de configuration 'roles'/'tank'/'idEmoji' n'est pas renseignée. Elle correspond à l'identifiant de l'emoji associé au rôle 'tank'.");
			}
		}
	}

	if (errors.length > 0) {
		console.error(errors.join('\n'));
	}
	else {
		const rolesTrigger = client.triggers.get('roles');
		rolesTrigger.handle(client);

		const rosterTrigger = client.triggers.get('roster');
		rosterTrigger.handle(client);
	}
};

module.exports.command = {
	name: 'check',
	description: 'vérifie la configuration du fichier config.json',
	handle: handle
};
