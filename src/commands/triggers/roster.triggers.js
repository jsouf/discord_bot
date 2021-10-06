const { MessageEmbed } = require('discord.js');
const { channels, roles } = require('../../../config.json');

const titleMessageEmbed = 'Roster';

async function handle(client) {
    const channel = client.channels.cache.get(channels.roster);
    await updateOrCreateMessageRoster(client, channel);
};

async function updateOrCreateMessageRoster(client, channel) {
    if (channel) {
        let messageRosterEmbed;
        const idBot = client.user.id;
        const predicateIsMessageRoster = msg => {
            const isBot = msg.author.id === idBot;
            const embed = msg.embeds ? msg.embeds[0] : '';
            return isBot && embed && embed.title.length > 0 && embed.title.trim() === titleMessageEmbed;
        }
        const messageRoster = (await channel.messages.fetch()).find(predicateIsMessageRoster);
        if (messageRoster) {
            messageRosterEmbed = messageRoster.embeds[0];
        }

        const messageEmbed = await showPlayersByRole(channel);

        if (messageRosterEmbed && messageRosterEmbed.length > 0) {
            messageRoster.edit(messageEmbed);
        }
        else {
            channel.send(messageEmbed);
        }
    }
}

async function showPlayersByRole(channel) {
    let fields = [];
    let messageEmbed = new MessageEmbed()
        .setColor('#202225')
        .setTitle(titleMessageEmbed);

    for (const key of Object.keys(roles)) {
        const role = roles[key];
        let roleDiscord = await channel.guild.roles.fetch(role.id);
        if (roleDiscord) {
            if (roleDiscord.members && roleDiscord.members.size > 0) {
                const members = roleDiscord.members.sort();
                let iterationMember = 0;
                let roleValue = `\n \u200B \n ${roleDiscord} \n\n`;
                let firstFieldExist = false;
                let fieldValue = '';

                for (const member of members) {
                    fieldValue += `<@${member[0]}>\n`;
                    if (iterationMember === 5) {
                        fields.push({ name: '_', value: !firstFieldExist ? roleValue + fieldValue : fieldValue, inline: firstFieldExist });
                        firstFieldExist = true;
                        iterationMember = 0;
                    }
                    iterationMember++;
                }

                if(iterationMember < 5) {
                    fields.push({ name: '_', value: !firstFieldExist ? roleValue + fieldValue : fieldValue });
                }
            }
            else {
                fields.push({ name: `${roleDiscord}`, value: 'aucun joueur' });
            }
        }
    }

    if (fields.length > 0) {
        messageEmbed.addFields(fields);
    }

    return messageEmbed;
}

module.exports.command = {
    name: 'roster',
    description: 'Crée ou met à jour la liste les joueurs pour chaque rôles configurés',
    handle: handle
};

