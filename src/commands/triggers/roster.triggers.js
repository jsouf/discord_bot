const { MessageEmbed } = require('discord.js');
const { channels, roles } = require('../../../config.json');
const { titleMessageWeapons } = require('./weapons.triggers').command;

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

        const messageEmbed = await showPlayersByRole(client, channel);

        if (messageRosterEmbed && messageRosterEmbed.length > 0) {
            messageRoster.edit(messageEmbed);
        }
        else {
            channel.send(messageEmbed);
        }
    }
}

async function showPlayersByRole(client, channel) {
    let fields = [];
    let messageEmbed = new MessageEmbed()
        .setColor('#202225')
        .setTitle(titleMessageEmbed);

    let messageWeaponsReactions;
    const idBot = client.user.id;
    const predicateIsMessageWeapons = msg => {
        const isBot = msg.author.id === idBot;
        const embed = msg.embeds ? msg.embeds[0] : '';
        return isBot && embed && embed.title.length > 0 && embed.title.trim() === titleMessageWeapons;
    };
    const messageWeapons = (await channel.messages.fetch()).find(predicateIsMessageWeapons);
    let usersWeaponsReactions = [];
    if(messageWeapons) {
        messageWeaponsReactions = Array.from(messageWeapons.reactions.cache);
        if(messageWeaponsReactions) {
            try {
                for(const weaponReaction of messageWeaponsReactions) {
                    let users = await weaponReaction[1].users.fetch();
                    if(users) {
                        users = Array.from(users);
                        usersWeaponsReactions.push([weaponReaction, users]);
                    }
                }
            }
            catch { 
                console.error; 
            }
        }
    }

    for (const key of Object.keys(roles)) {
        const role = roles[key];
        const roleDiscord = await channel.guild.roles.fetch(role.id);
        let roleValue = `\n \u200B \n ${roleDiscord} \n\n`;

        if (roleDiscord) {
            if (roleDiscord.members && roleDiscord.members.size > 0) {
                const members = roleDiscord.members.sort((a, b) => (a.displayName > b.displayName) ? 1 : -1);
                let iterationMember = 1;
                let firstFieldExist = false;
                let fieldValue = '';

                for (const member of members) {
                    let emojisWeaponUser = [];

                    if(usersWeaponsReactions && usersWeaponsReactions.length > 0) {
                        usersWeaponsReactions.forEach(usersReaction => { 
                            const userIsFound = usersReaction[1].find(user => 
                                !user[1].bot && user[1].id === member[0]
                            ); 
                            if(userIsFound) { emojisWeaponUser.push(usersReaction[0][1].emoji); }
                        });
                    }
                    
                    const weaponsMember = emojisWeaponUser.length > 0 ? emojisWeaponUser.join('\u200B') : '\u200B';
                    fieldValue += `<@${member[0]}> ${weaponsMember}\n`;
                    if (iterationMember === 5) {
                        fields.push({ name: '\u200B', value: !firstFieldExist ? `${roleValue}${fieldValue}` : fieldValue, inline: firstFieldExist });
                        firstFieldExist = true;
                        iterationMember = 1;
                        fieldValue = '\u200B';
                    }
                    iterationMember++;
                }

                if(iterationMember < 5) {
                    fields.push({ name: '\u200B', value: !firstFieldExist ? `${roleValue}${fieldValue}` : fieldValue });
                }
            }
            else {
                fields.push({ name: '\u200B', value: `${roleValue}aucun joueur\n` });
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

