const { channels, roles } = require('../../../config.json');

async function handle(client, messageReaction, user) {
    const message = messageReaction.message;
    const member = message.guild.members.cache.get(user.id);
    if (member.user.bot) return;

    const isRoleChannel = message.channel.id === channels.roles;
    if (isRoleChannel) {
        const emoji = messageReaction.emoji.id;
        let managedRoles = [];
        for(const role of Object.keys(roles)) {
            managedRoles.push(roles[role]);
        }

        const role = managedRoles.find(role => role.idEmoji === emoji);
        if(role){
            await member.roles.remove(role.id);
        }

        const rosterTrigger = client.triggers.get('roster');
        await rosterTrigger.handle(client);
    }
}

module.exports.command = {
    name: "deleteRole",
    description: "supprime le rôle du membre associé à la réaction",
    handle: handle
};
