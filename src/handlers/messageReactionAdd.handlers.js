const { roles, weapons } = require('../../config.json');

const handle = async (client, reaction, user) => {
	try {
		const idEmoji = reaction.emoji.id;
		const rolesEntries = Object.entries(roles);
		const idEmojisWeapons = Object.values(weapons);
		
		if(rolesEntries.find(role => role[1].idEmoji === idEmoji)) {
			const addRoleReaction = client.reactions.get('addRole');
			addRoleReaction.handle(client, reaction, user);
		}
		else if(idEmojisWeapons.find(id => id === idEmoji)) {
			const addWeaponReaction = client.reactions.get('addWeapon');
			addWeaponReaction.handle(client, reaction, user);
		}
	}
	catch {
		console.error;
	}
};

module.exports = handle;