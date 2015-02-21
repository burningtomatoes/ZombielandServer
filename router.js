var opcodes = require('./opcodes.js');
var ui = require('./ui.js');

var router = module.exports = {
    handlers: {},

    register: function (op, handler) {
        this.handlers[op] = handler;
    },

    route: function (server, connection, data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            ui.writeLog('Connection ' + connection.id + ' sent bad data! Closing connection.');
            connection.disconnect();
            return;
        }

        if (typeof data.op == 'undefined') {
            return;
        }

        if (typeof this.handlers[data.op] != 'undefined') {
            var handlerFn = this.handlers[data.op];
            handlerFn(connection, data);
        }
    }
};

router.register(opcodes.LOGIN, function (connection, data) {
    console.log('LOGIN ATTEMPT FROM ' + data.username + ' / ' + data.password);
});