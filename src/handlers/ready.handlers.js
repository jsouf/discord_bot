const handle = async (client) => {
    console.log('- App running -');
	try {	
        const checkConfiguration = client.configurations.get('check');
        checkConfiguration.handle(client);
	}
	catch {
		console.error;
	}
};

module.exports = handle;