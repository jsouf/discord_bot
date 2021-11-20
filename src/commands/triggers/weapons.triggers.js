const { MessageEmbed } = require('discord.js');
const { channels, weapons } = require('../../../config.json');

const titleMessageEmbed = 'Assigner des armes';

async function handle(client) {
	const channel = client.channels.cache.get(channels.weapons);
	await updateOrCreateMessageWeapons(client, channel);
}

async function updateOrCreateMessageWeapons(client, channel) {
	if (channel) {
		const idBot = client.user.id;
		const predicateIsMessageWeapon = msg => { 
			const isBot = msg.author.id === idBot;
			const embed = msg.embeds ? msg.embeds[0] : '';
			return isBot && embed && embed.title.length > 0 && embed.title.trim() === titleMessageEmbed;
		};
		const messageWeapon = (await channel.messages.fetch()).find(predicateIsMessageWeapon);

		if (!messageWeapon) {
			let emojis = [];
			let fieldValue = '';

			for (const [key, value] of Object.entries(weapons)) {
				const weapon = channel.guild.emojis.cache.get(value);
				if (weapon) {
					fieldValue += `${weapon} - ${key} \n \u200B`;
					emojis.push(weapon);
				}
			}

			if (emojis.length > 0) {
				const weaponsChannel = channel.guild.channels.cache.get(channels.weapons);
				const messageEmbed = new MessageEmbed()
					.setColor('#202225')
					.setTitle(titleMessageEmbed)
					.setDescription('Cliquez sur une des réactions ci-dessous pour vous assigner une arme !')
					.addField(
						'Liste des armes :',
						fieldValue
					);

				await weaponsChannel.send(messageEmbed).then(async msg => {
					for (const emoji of emojis) {
						await msg.react(emoji);
					}
				});
			}
		}
	}
}

module.exports.command = {
	name: 'weapons',
	description: 'Crée ou met à jour la liste des armes pour chaque joueur',
	handle: handle,
	titleMessageWeapons: titleMessageEmbed
};

