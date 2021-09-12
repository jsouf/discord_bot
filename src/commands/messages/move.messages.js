const { categories, messageDeletionInterval, officers, roles, prefix } = require('../../../config.json');

async function handle(message, args, command, client) {
	const isEventsChannel = message.channel.parentID === categories.events;
	const isOfficer = message.member.roles.cache.has(officers.idRole);
	let isValidCommand = false;

	if (isEventsChannel) {
		if (isOfficer && args.length > 0) {
			let currentArg = args[0];
			if (currentArg.length > 0) {
				isValidCommand = await movePlayerInEvent(message, currentArg, client);
			}
		}

		if (isValidCommand) {
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

async function movePlayerInEvent(message, currentArg, client) {
	const numberGroup = parseInt(currentArg);
	const isValidCommand = !isNaN(numberGroup) && numberGroup >= 1 && numberGroup <= 10;
	
	if (isValidCommand) {
		const mentionsMembers = message.mentions.members;
		if (mentionsMembers && mentionsMembers.size === 1) {
			const member = mentionsMembers.entries().next().value[1];
			if (member && member.user && !member.user.bot) {
				const indexGroup = numberGroup - 1;
				const channel = message.channel;
				const idBot = client.user.id;
				const messages = await channel.messages.fetch();
				const messageInscription = messages.find(msg => msg.author.id === idBot);
				const messageInscriptionEmbed = messageInscription.embeds[0];
				let groups = messageInscriptionEmbed.fields;
				let group = groups[indexGroup];

				const groupHasFreeSlot = group.value.includes('libre');
				if (groupHasFreeSlot) {
					groups = await removePlayerFromGroups(groups, member);
					group = await addPlayerToGroup(group, member);
					messageInscriptionEmbed.spliceFields(0, groups.length, groups);
					messageInscription.edit(messageInscriptionEmbed);
				}
			}
		}
	}

	return isValidCommand;
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
	name: 'move',
	description: "permet à un modérateur de déplacer un joueur inscrit à un événement ou l'inscrit au groupe",
	help: `${prefix}move #1 @player
		#1 : numéro du groupe (compris entre 1 à 10)
		@player : tag du joueur à déplacer ou à inscrire`,
	handle: handle
};
