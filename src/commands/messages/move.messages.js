const { categories, channels, messageDeletionInterval, officers, roles, prefix } = require('../../../config.json');
const { titleMessageWeapons } = require('../triggers/weapons.triggers').command;

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
				const idBot = client.user.id;
				const messages = await message.channel.messages.fetch();
				const messageInscription = messages.find(msg => msg.author.id === idBot);
				const messageInscriptionEmbed = messageInscription.embeds[0];
				let groups = messageInscriptionEmbed.fields;
				let group = groups[indexGroup];

				const groupHasFreeSlot = group.value.includes('libre');
				if (groupHasFreeSlot) {
					groups = await removePlayerFromGroups(groups, member);
					group = await addPlayerToGroup(client, message, group, member);
					messageInscriptionEmbed.spliceFields(0, groups.length, groups);
					messageInscription.edit(messageInscriptionEmbed);
				}
			}
		}
	}

	return isValidCommand;
}

async function addPlayerToGroup(client, message, group, member) {
	let groupValues = group.value.split(/\r?\n/);
	let indexFreeSlot = groupValues.findIndex(value => value.trim().toLowerCase() === 'libre');
	if (indexFreeSlot > -1) {
		let playerRoles = await getPlayerRoles(member);
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
						if(users.find(user => !user[1].bot && user[1].id === member.user.id)) {
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

		groupValues[indexFreeSlot] = `${weaponsMember} <@${member.id}> - ${playerRoles.map(role => `${role}`).join(' ')}`;
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
