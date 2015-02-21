var mysql = require('mysql');
var config = require('./config.js');
var ui = require('./ui.js');

module.exports = {
    connection: null,

    connect: function () {
        ui.writeLog('Connecting to MySQL server...');

        this.connection = mysql.createConnection(config.db);
        this.connection.connect();
    }
};
