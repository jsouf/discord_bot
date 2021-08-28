const { Collection } = require('discord.js');
const fs = require('fs');

const loader = (namespace) => {
    const namespacePath = `${__dirname}/commands/${namespace}`;
    const commandFiles = fs.readdirSync(namespacePath).filter(file => file.endsWith(`${namespace}.js`));

    let commands = new Collection();

    for (const file of commandFiles) {
        const command = require(`${namespacePath}/${file}`).command;
        commands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach((alias) => { commands.set(alias, command); });
        }
    }

    return commands;
};

exports.loader = loader;