const fs = require('fs');

function getDataFromJsonFile(entityName) {
    const jsonData = fs.readFileSync(getFilePath(entityName));
    const entities = JSON.parse(jsonData);

    return entities;
}

function setDataToJsonFile(entityName, entities) {
    const jsonData = JSON.stringify(entities);

    fs.writeFileSync(getFilePath(entityName), jsonData);
}

function getFilePath(entityName) {
    return `./database/${entityName}.db.json`;
}

exports.utilsService = {
    getData: getDataFromJsonFile,
    setData: setDataToJsonFile
};
