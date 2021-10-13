const { channels, weapons } = require('../../../config.json');

async function handle(client, messageReaction, user) {
    const message = messageReaction.message;
    const member = message.guild.members.cache.get(user.id);
    if (member.user.bot) return;

    const isWeaponsChannel = message.channel.id === channels.weapons;
    if (isWeaponsChannel) {
        const idEmoji = messageReaction.emoji.id;
        const idEmojisWeapons = Object.values(weapons);

        const weapon = idEmojisWeapons.find(id => id === idEmoji);
        if(weapon){
            const rosterTrigger = client.triggers.get('roster');
            await rosterTrigger.handle(client);
        }
    }
}

module.exports.command = {
    name: "deleteWeapon",
    description: "supprime l'arme au membre associé à la réaction",
    handle: handle
};
