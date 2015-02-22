GLOBAL.ui = require('./ui.js');
GLOBAL.net = require('./net.js');
GLOBAL.config = require('./config.js');
GLOBAL.db = require('./db.js');
GLOBAL.router = require('./router.js');
GLOBAL.opcodes = require('./opcodes.js');
GLOBAL.mapManager = require('./map_manager.js');

GLOBAL.Map = require('./map.js');
GLOBAL.Entity = require('./entity.js');
GLOBAL.User = require('./user.js');

ui.printWelcome();
db.connect();
mapManager.init();

net.start(config.port);