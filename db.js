var mysql = require('mysql');

module.exports = {
    connection: null,

    connect: function () {
        ui.writeLog('Connecting to MySQL server...');

        this.connection = mysql.createConnection(config.db);
        this.connection.connect();
    }
};
