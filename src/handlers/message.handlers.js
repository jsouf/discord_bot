const { categories, channels, messageDeletionInterval, officers, prefix } = require('../../config.json');

const handle = async (client, message) => {
	try {
		if (shouldIgnoreMessage(message)) { return; }

		const managedCategories = Object.entries(categories).map(element => element[1]);
		const categoryId = message.channel.parent.id;
		const isEventChannel = managedCategories.includes(categoryId);
		const isOfficer = message.member.roles.cache.has(officers.idRole);
		const args = message.content.slice(prefix.length).split(/ +/);
		const command = args.shift().toLowerCase();

		let shouldDeleteMessage = false;

		if (message.content.startsWith(prefix) && client.commands.has(command)) {
			const module = client.commands.get(command);
			module.handle(message, args, command, client);
		}
		else {
			shouldDeleteMessage = isEventChannel && !isOfficer;
		}

		if (shouldDeleteMessage) {
			message.react('❓');
			setTimeout(() => {
				message.delete();
			}, messageDeletionInterval * 1000);
		}
	}
	catch {
		console.error;
	}
};

const shouldIgnoreMessage = (message) => {
	if(message.author.bot) { return true; }

	const trackedIdChannels = Object.entries(channels).map(element => element[1]);
	if(trackedIdChannels.includes(message.channel.id)) { return false; }
	
	const trackedIdCategory = Object.entries(categories).map(element => element[1]);
	if(trackedIdCategory.includes(message.channel.parent.id)) { return false; }

	return true;
};

module.exports = handle;