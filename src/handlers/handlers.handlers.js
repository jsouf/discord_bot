const messageHandler = require('./message.handlers');
const messageReactionAddHandler = require('./messageReactionAdd.handlers');
const messageReactionDeleteHandler = require('./messageReactionDelete.handlers');
const readyHandler = require('./ready.handlers');

module.exports = {
    messageHandler: messageHandler,
    messageReactionAddHandler: messageReactionAddHandler,
    messageReactionDeleteHandler: messageReactionDeleteHandler,
    readyHandler: readyHandler
};