GLOBAL.ui = require('./ui.js');
GLOBAL.net = require('./net.js');
GLOBAL.config = require('./config.js');
GLOBAL.db = require('./db.js');
GLOBAL.router = require('./router.js');
GLOBAL.opcodes = require('./opcodes.js');

ui.printWelcome();
db.connect();
net.start(config.port);