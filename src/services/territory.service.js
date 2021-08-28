const { utilsService } = require('./service.utils');

const entityName = 'territory';

async function getAll() {
    return await utilsService.getData(entityName);
};

async function getByAlias(alias) {
    let territory = {};

    if(alias.length > 0) {
        const territories = await utilsService.getData(entityName);

        if(territories) {
            territory = territories.find(t => t.alias.toLowerCase() === alias.toLowerCase());
        }
    }

    return territory;
}

exports.service = {
    getAll: getAll,
    getByAlias: getByAlias
};