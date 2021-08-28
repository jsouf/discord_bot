const { MessageEmbed } = require('discord.js');
const { channels, messageDeletionInterval, roles } = require('../../../config.json');

async function handle(message) {
    const isConfigChannel = message.channel.id === channels.config;

    if (isConfigChannel) {
        await showPlayersByRole(message);

        message.react('✅');
        setTimeout(() => {
            message.delete();
        }, messageDeletionInterval * 1000);
    }
};

async function showPlayersByRole(message) {
    let fieldValue = '';
    for (const key of Object.keys(roles)) {
        const role = roles[key];
        let roleDiscord = message.guild.roles.cache.get(role.id);
        if (roleDiscord) {
            let players = 'aucun joueur';
            if (roleDiscord.members && roleDiscord.members.size > 0) {
                players = roleDiscord.members.map(member => `${member}`).sort().join(' | ');
            }
            fieldValue += `\n \u200B \n ${roleDiscord} \n \n ${players}`;
        }
    }

    if (fieldValue.length > 0) {
        const messageEmbed = new MessageEmbed()
            .setColor('#202225')
            .addField(
                'Liste des joueurs',
                fieldValue
            );

        const channelRoster = message.guild.channels.cache.get(channels.roster);
        channelRoster.send(messageEmbed);
    }
}

module.exports.command = {
    name: 'players',
    description: 'liste les joueurs pour chaque rôles configurés',
    help: '!players',
    handle: handle
};

