const { MessageEmbed } = require('discord.js');
const { channels, messageDeletionInterval } = require('../../../config.json');
const { service } = require('../../services/service');

async function handle(message) {
    const isConfigChannel = message.channel.id === channels.config;

    if (isConfigChannel) {
        await showTerritories(message);

        message.react('✅');
        setTimeout(() => {
            message.delete();
        }, messageDeletionInterval * 1000);
    }
};

async function showTerritories(message) {
    const promise = service.territories.getAll();
    const territories = await promise
        .then((data) => { return data; })
        .catch(console.error);

    let fieldValue = '\n \u200B';

    if (territories && territories.length > 0) {
        territories.sort((a, b) => (a.name > b.name) ? 1 : -1);
        for (const territory of territories) {
            fieldValue += `\n${territory.name} - **${territory.alias}**`;
        }
        const messageEmbed = new MessageEmbed()
            .setColor('#202225')
            .addField(
                'Liste des territoires',
                fieldValue
            );

        message.channel.send(messageEmbed);
    }
}

module.exports.command = {
    name: 'territories',
    description: 'liste les territoires',
    help: '!territories',
    handle: handle
};
