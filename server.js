var ui = require('./ui.js');
var signaling = require('./signaling.js');
var config = require('./config.js');

ui.printWelcome();
signaling.start(config.port);