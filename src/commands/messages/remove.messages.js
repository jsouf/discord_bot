const { categories, messageDeletionInterval, roles, prefix, officers } = require('../../../config.json');

async function handle(message, args, command, client) {
	const isEventsChannel = message.channel.parentID === categories.events;
	const isOfficer = message.member.roles.cache.has(officers.idRole);

	if (isEventsChannel) {
		if (isOfficer) {
			await removePlayerInWar(message, client);

			message.react('✅');
		}
		else {
			message.react('❓');
		}
		setTimeout(() => {
			message.delete();
		}, messageDeletionInterval * 1000);
	}
};

async function removePlayerInWar(message, client) {
	const mentionsMembers = message.mentions.members;
	if (mentionsMembers && mentionsMembers.size === 1) {
		const member = mentionsMembers.entries().next().value[1];
		const channel = message.channel;
		const idBot = client.user.id;
		const messageInscription = (await channel.messages.fetch()).find(msg => msg.author.id === idBot);
		const messageInscriptionEmbed = messageInscription.embeds[0];
		let groups = messageInscriptionEmbed.fields;

		groups = await removePlayerFromGroups(groups, member);
		messageInscriptionEmbed.spliceFields(0, groups.length, groups);
		messageInscription.edit(messageInscriptionEmbed);
	}
}

async function addPlayerToGroup(group, member) {
	let groupValues = group.value.split(/\r?\n/);
	let indexFreeSlot = groupValues.findIndex(value => value.trim().toLowerCase() === 'libre');
	if (indexFreeSlot > -1) {
		let playerRoles = await getPlayerRoles(member);
		groupValues[indexFreeSlot] = `<@${member.id}> - ${playerRoles.map(role => `${role}`).join(' ')}`;
	}

	group.value = groupValues.join('\n');

	return group;
}

async function removePlayerFromGroups(groups, member) {
	for (let group of groups) {
		let groupValues = group.value.split(/\r?\n/);
		let indexGroupValue = -1;
		do {
			indexGroupValue = groupValues.findIndex(value => value.trim().includes(`<@${member.id}>`));
			if (indexGroupValue > -1) {
				groupValues[indexGroupValue] = 'libre';
			}
		}
		while (indexGroupValue > -1);

		group.value = groupValues.join('\n');
	}

	return groups;
}

async function getPlayerRoles(member) {
	let playerRoles = member.roles.cache;
	if (playerRoles && playerRoles.size > 0) {
		const managedRoles = [roles.tank.id, roles.heal.id, roles.dps.id];
		playerRoles = playerRoles.filter(role => managedRoles.includes(role.id));
	}

	return playerRoles;
}

module.exports.command = {
	name: 'remove',
	description: "permet à un modérateur de désinscrire un joueur d'un événement",
	help: `${prefix}remove @player
		@player : joueur à désinscrire`,
	handle: handle
};
