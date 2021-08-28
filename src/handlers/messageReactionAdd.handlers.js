const handle = async (client, reaction, user) => {
	try {
		const addRoleReaction = client.reactions.get('addRole');
		addRoleReaction.handle(client, reaction, user);
	}
	catch {
		console.error;
	}
};

module.exports = handle;