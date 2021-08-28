const { channels, messageDeletionInterval } = require('../../../config.json');
const commandName = "help";

async function handle(message, args, command, client) {
    const isConfigChannel = message.channel.id === channels.config;

    if (isConfigChannel) {
        await showCommands(message, client);

        message.react('✅');
        setTimeout(() => {
            message.delete();
        }, messageDeletionInterval * 1000);
    }
};

async function showCommands(message, client) {
    const commands = client.commands;
    let messageContent = '';

    for (const keyValue of commands) {
        if (commandName === keyValue[0]) {
            continue;
        }

        const command = keyValue[1];
        const description = `${command.description}`;
        messageContent += `== **${command.name}** == \n_${description}_\n\`\`\`${command.help}\`\`\`\n`;
    }
    if (messageContent.length > 0) {
        message.channel.send(messageContent);
    }
}

module.exports.command = {
    name: commandName,
    description: 'liste les commandes disponibles',
    handle: handle
};
