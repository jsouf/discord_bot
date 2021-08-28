const { MessageEmbed } = require('discord.js');
const { service } = require('../../services/service');
const { categories, channels, messageDeletionInterval, messageSlowModeInterval, prefix } = require('../../../config.json');
const moment = require('moment');

moment.locale('fr');
const formatDate = 'DD/MM/YYYY HH:mm';

async function handle(message, args) {
    const isConfigChannel = message.channel.id === channels.config;

    if (isConfigChannel) {
        const idWarsCategory = categories.events;
        const warsCategory = message.guild.channels.cache.get(idWarsCategory);

        if (warsCategory && !warsCategory.deleted) {
            if (!args.length) {
                return message.reply("Tu n'as pas renseigné d'arguments à la commande !");
            }

            const commandResult = await parseArguments(args);

            if (commandResult.errors && commandResult.errors.length > 0) {
                return message.reply(commandResult.errors.join('\n'));
            }

            const warInformations = commandResult.arguments;
            const warDate = warInformations.date.format('DD/MM/YYYY').replace(new RegExp('/', "g"), '_');
            const channelName = `${warDate}_${warInformations.location}`;
            const channel = await message.guild.channels.create(channelName, {
                parent: idWarsCategory,
                position: 1,
                type: 'text'
            });

            const interval = messageSlowModeInterval || 3;
            channel.setRateLimitPerUser(interval, `limité à ${interval} secondes entre chaque message !`);

            if (!channel) {
                return message.reply("Une erreur est survenue lors de la création du channel !");
            }

            const warMessageEmbed = await getMessageEmbed(warInformations, message);
            const warMessageContent = "@everyone \n Commandes disponibles :\n - **!join #** pour s'inscrire à un groupe !\n _(# correspond au numéro du groupe)_ \n - **!leave** pour vous désinscrire !";
            await channel.send(warMessageContent, warMessageEmbed);
        }

        message.react('✅');
        setTimeout(() => {
            message.delete();
        }, messageDeletionInterval * 1000);
    }
}

async function parseArguments(args) {
    let argumentsList = {};
    let errors = [];

    if (args && args.length > 0) {
        const commandLineArguments = args.join(' ');
        const arguments = commandLineArguments.split("--").filter(arg => arg ? arg.trim() : false);

        if (arguments && arguments.length > 0) {
            let errorsCommandLine = [];
            let warLocation = '';
            let momentWarDate = '';

            const warTitleArgument = await parseArgument('title', arguments);
            if (!warTitleArgument) errorsCommandLine.push("--title");

            const warLocationArgument = await parseArgument('location', arguments);
            if (!warLocationArgument) errorsCommandLine.push("--location");

            const warDateArgument = await parseArgument('date', arguments);
            if (!warDateArgument) errorsCommandLine.push("--date");

            if (errorsCommandLine.length > 0) {
                errors.push(`Il manque les arguments suivants : ${errorsCommandLine.join(', ')}`);
            }
            else {
                const promiseTerritory = service.territories.getByAlias(warLocationArgument);
                const territory = await promiseTerritory
                    .then((data) => { return data; })
                    .catch((error) => { console.error(error); });

                if (!territory) {
                    errors.push(`L'alias du territoire ${warLocationArgument} n'existe pas ! Type !territories pour afficher la liste des territoires`);
                }
                else {
                    warLocation = territory.name;
                }

                momentWarDate = moment(warDateArgument, formatDate);
                if (!momentWarDate || !momentWarDate.isValid()) {
                    errors.push(`La date n'est pas au bon format ! exemple : ${moment().format(formatDate)}`);
                }
            }

            if (errors.length === 0) {
                argumentsList['title'] = warTitleArgument;
                argumentsList['location'] = warLocation;
                argumentsList['date'] = momentWarDate;
            }
        }
    }

    return { arguments: argumentsList, errors: errors };
}

async function parseArgument(alias, arguments) {
    let argument = '';

    if (arguments && alias && arguments.length > 0 && alias.length > 0) {
        alias = `${alias}=`;
        argument = arguments.find(arg => arg.startsWith(alias));
        if (argument) {
            argument = argument.replace(alias, '').trim();
        }
    }

    return argument;
}

async function getMessageEmbed(informations) {
    let fields = [];
    
    for (i = 0; i < 10; i++) {
        fields.push({ name: `Groupe ${i + 1}`, value: 'libre\nlibre\nlibre\nlibre\nlibre', inline: true });
    }

    const warDate = informations.date.format('DD MMMM YYYY, HH:mm');
    const description = `\n Lieu : **${informations.location}** \n Date : **${warDate}** \n \u200B`;
    const title = `${informations.title} \u200B`;

    const messageEmbed = new MessageEmbed()
        .setColor('#202225')
        .setDescription(description)
        .setTitle(title)
        .addFields(fields);

    return messageEmbed;
}

module.exports.command = {
    name: 'event',
    description: "crée un nouvel événement",
    help: `${prefix}event --title=#1 --location=#2 --date=#3
        #1 : titre du message
        #2 : localisation de l'événément - renseigner alias de territoire (Type ${prefix}territories pour plus d'informations)
        #3 : date de l'événement - au format : 01/01/2021 21:00)`,
    handle: handle
};
