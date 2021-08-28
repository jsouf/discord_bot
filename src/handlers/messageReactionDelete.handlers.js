const handle = async (client, reaction, user) => {
	try {
		const deleteRoleReaction = client.reactions.get('deleteRole');
		deleteRoleReaction.handle(client, reaction, user);
	}
	catch {
		console.error;
	}
};

module.exports = handle;