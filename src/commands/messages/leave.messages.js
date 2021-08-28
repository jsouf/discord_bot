const { categories, messageDeletionInterval } = require('../../../config.json');

async function handle(message, args, command, client) {
	const isEventsChannel = message.channel.parentID === categories.events;

	if (isEventsChannel) {
		await leaveWar(message, client);

		message.react('✅');
		setTimeout(() => {
			message.delete();
		}, messageDeletionInterval * 1000);
	}
};

async function leaveWar(message, client) {
	const channel = message.channel;
	const idBot = client.user.id;
	const messageInscription = (await channel.messages.fetch()).find(msg => msg.author.id === idBot);
	const messageInscriptionEmbed = messageInscription.embeds[0];
	let groups = messageInscriptionEmbed.fields;

	groups = await removePlayerFromGroups(message, groups);
	messageInscriptionEmbed.spliceFields(0, groups.length, groups);
	messageInscription.edit(messageInscriptionEmbed);
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

module.exports.command = {
	name: 'leave',
	description: "désinscrit un joueur d'un événement",
	help: '!leave',
	handle: handle
};
