var ui = require('./ui.js');
var net = require('./net.js');
var config = require('./config.js');

ui.printWelcome();
net.start(config.port);