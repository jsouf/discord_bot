const { roles, weapons } = require('../../config.json');

const handle = async (client, reaction, user) => {
	try {
		const idEmoji = reaction.emoji.id;
		const rolesEntries = Object.entries(roles);
		const idEmojisWeapons = Object.values(weapons);

		if(rolesEntries.find(role => role[1].idEmoji === idEmoji)) {
			const deleteRoleReaction = client.reactions.get('deleteRole');
			deleteRoleReaction.handle(client, reaction, user);
		}
		else if(idEmojisWeapons.find(id => id === idEmoji)) {
			const deleteWeaponReaction = client.reactions.get('deleteWeapon');
			deleteWeaponReaction.handle(client, reaction, user);
		}
	}
	catch {
		console.error;
	}
};

module.exports = handle;