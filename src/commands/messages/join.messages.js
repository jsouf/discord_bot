const { categories, channels, messageDeletionInterval, roles, prefix } = require('../../../config.json');
const { titleMessageWeapons } = require('../triggers/weapons.triggers').command;

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
			group = await addPlayerToGroup(client, message, group);
			messageInscriptionEmbed.spliceFields(0, groups.length, groups);
			messageInscription.edit(messageInscriptionEmbed);
		}
	}
}

async function addPlayerToGroup(client, message, group) {
	let groupValues = group.value.split(/\r?\n/);
	let indexFreeSlot = groupValues.findIndex(value => value.trim().toLowerCase() === 'libre');
	if (indexFreeSlot > -1) {
		let playerRoles = await getPlayerRoles(message);
		let messageWeaponsReactions;
		const idBot = client.user.id;
		const predicateIsMessageWeapons = msg => {
			const isBot = msg.author.id === idBot;
			const embed = msg.embeds ? msg.embeds[0] : '';
			return isBot && embed && embed.title.length > 0 && embed.title.trim() === titleMessageWeapons;
		};
		const channelWeapons = await client.channels.fetch(channels.weapons);
		const messageWeapons = (await channelWeapons.messages.fetch()).find(predicateIsMessageWeapons);
		if(messageWeapons) {
			messageWeaponsReactions = Array.from(messageWeapons.reactions.cache);
		}
		let reactionsWeaponsMember = [];
		if(messageWeaponsReactions) {
			try {
				for(const weaponReaction of messageWeaponsReactions) {
					let users = await weaponReaction[1].users.fetch();
					if(users) {
						users = Array.from(users);
						if(users.find(user => !user[1].bot && user[1].id === message.author.id)) {
							reactionsWeaponsMember.push(weaponReaction[1].emoji);
						}
					}
				}
			}
			catch { 
				console.error; 
			}
		}
		const weaponsMember = reactionsWeaponsMember.length > 0 ? reactionsWeaponsMember.join(' ') : ' ';

		groupValues[indexFreeSlot] = `${weaponsMember} <@${message.author.id}> - ${playerRoles.map(role => `${role}`).join(' ')}`;
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
