const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { messageHandler, messageReactionAddHandler, messageReactionDeleteHandler, readyHandler } = require('./src/handlers/handlers.handlers');
const { loader } = require('./src/loader');

process.on('uncaughtException', error => {
	console.error(`Uncaught Exception : ${error.message}`);
});
process.on('unhandledRejection', (error, promise) => {
	console.error('Unhandled rejection at : ', promise, `reason: ${error.message}`);
});

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
	partials: ['MESSAGE', 'REACTION', 'CHANNEL']
});

client.commands = loader('messages');
client.triggers = loader('triggers');
client.configurations = loader('configurations');
client.reactions = loader('reactions');

client.on('ready', async () => {
	readyHandler(client);
});

client.on('message', message => {
	messageHandler(client, message);
});

client.on('messageReactionAdd', async (reaction, user) => {
	messageReactionAddHandler(client, reaction, user);
});

client.on('messageReactionRemove', async (reaction, user) => {
	messageReactionDeleteHandler(client, reaction, user);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(token);
