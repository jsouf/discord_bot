const { categories, messageDeletionInterval, roles, prefix } = require('../../../config.json');

async function handle(message, args, command, client) {
	const isEventsChannel = message.channel.parentID === categories.events;

	if (isEventsChannel) {
		if (args.length > 0) {
			let currentArg = args[0];
			if (currentArg.length > 0) {
				await joinWarGroup(message, currentArg, client);
			}
		}

		message.react('✅');
		setTimeout(() => {
			message.delete();
		}, messageDeletionInterval * 1000);
	}
};

async function joinWarGroup(message, currentArg, client) {
	if (!isNaN(currentArg) && currentArg >= 1 && currentArg <= 10) {
		const channel = message.channel;
		const idBot = client.user.id;
		const messageInscription = (await channel.messages.fetch()).find(msg => msg.author.id === idBot);
		const messageInscriptionEmbed = messageInscription.embeds[0];
		let groups = messageInscriptionEmbed.fields;
		const indexGroup = groups.findIndex(group => group.name.trim() === `Groupe ${currentArg}`);
		let group = groups[indexGroup];

		const groupHasFreeSlot = group.value.includes('libre');
		if (groupHasFreeSlot) {
			groups = await removePlayerFromGroups(message, groups);
			group = await addPlayerToGroup(message, group);
			messageInscriptionEmbed.spliceFields(0, groups.length, groups);
			messageInscription.edit(messageInscriptionEmbed);
		}
	}
}

async function addPlayerToGroup(message, group) {
	let groupValues = group.value.split(/\r?\n/);
	let indexFreeSlot = groupValues.findIndex(value => value.trim().toLowerCase() === 'libre');
	if (indexFreeSlot > -1) {
		let playerRoles = await getPlayerRoles(message);
		groupValues[indexFreeSlot] = `<@${message.author.id}> - ${playerRoles.map(role => `${role}`).join(' ')}`;
	}

	group.value = groupValues.join('\n');

	return group;
}

async function removePlayerFromGroups(message, groups) {
	for (let group of groups) {
		let groupValues = group.value.split(/\r?\n/);
		let indexGroupValue = -1;
		do {
			indexGroupValue = groupValues.findIndex(value => value.trim().includes(`<@${message.author.id}>`));
			if (indexGroupValue > -1) {
				groupValues[indexGroupValue] = 'libre';
			}
		}
		while (indexGroupValue > -1);

		group.value = groupValues.join('\n');
	}

	return groups;
}

async function getPlayerRoles(message) {
	let playerRoles = message.member.roles.cache;
	if (playerRoles && playerRoles.size > 0) {
		const managedRoles = [roles.tank.id, roles.heal.id, roles.dps.id];
		playerRoles = playerRoles.filter(role => managedRoles.includes(role.id));
	}

	return playerRoles;
}

module.exports.command = {
	name: 'join',
	description: "inscrit un joueur à un groupe d'un événement",
	help: `${prefix}join #
		# : numéro du groupe (compris entre 1 à 10)`,
	handle: handle
};
