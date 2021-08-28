const { MessageEmbed, MessageFlags } = require('discord.js');
const { channels, roles } = require('../../../config.json');

async function handle(client) {
	const channel = client.channels.cache.get(channels.roles);
	await updateOrCreateMessageRoles(client, channel);
}

async function updateOrCreateMessageRoles(client, channel) {
	if (channel) {
		const idBot = client.user.id;
		const titleMessageEmbed = 'Obtenir un rôle';
		const predicateIsMessageRole = msg => { 
			const isBot = msg.author.id === idBot;
			const embed = msg.embeds ? msg.embeds[0] : '';
			return isBot && embed && embed.title.length > 0 && embed.title.trim() === titleMessageEmbed;
		}
		const messageRoster = (await channel.messages.fetch()).find(predicateIsMessageRole);

		if (!messageRoster) {
			let emojis = [];
			let fieldValue = '\u200B \n ';

			for (const key of Object.keys(roles)) {
				const idRole = roles[key].id;
				const idEmoji = roles[key].idEmoji;
				const role = channel.guild.roles.cache.get(idRole);
				const emoji = channel.guild.emojis.cache.get(idEmoji);
				if (role && emoji) {
					fieldValue += `${emoji} - ${role} \n \u200B \n `;
					emojis.push(emoji);
				}
			}

			if (emojis.length > 0) {
				const rolesChannel = channel.guild.channels.cache.get(channels.roles);
				const messageEmbed = new MessageEmbed()
					.setColor('#202225')
					.setTitle(titleMessageEmbed)
					.setDescription('Cliquez sur une des réactions ci-dessous pour obtenir le rôle correspondant !')
					.addField(
						'Liste des rôles :',
						fieldValue
					);

				await rolesChannel.send(messageEmbed).then(async msg => {
					for (const emoji of emojis) {
						await msg.react(emoji);
					}
				});
			}
		}
	}
}

module.exports.command = {
	name: 'roles',
	description: 'Crée ou met à jour la liste les joueurs pour chaque rôles configurés',
	handle: handle
};

