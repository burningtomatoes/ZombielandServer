var ui = require('./ui.js');
var net = require('./net.js');
var config = require('./config.js');
var db = require('./db.js');

ui.printWelcome();
db.connect();
net.start(config.port);