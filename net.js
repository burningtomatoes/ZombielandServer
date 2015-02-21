var nodeStatic = require('node-static');
var http = require('http');
var file = new (nodeStatic.Server)();

module.exports = {
    app: null,
    io: null,

    connections: [],

    idGenerator: null,

    start: function (port) {
        ui.writeLog('Setting up HTTP listener on port ' + port + '...');

        this.app = http.createServer(function (req, res) {
            file.serve(req, res);
        }).listen(port);

        this.io = require('socket.io').listen(this.app);
        this.io.sockets.on('connection', this.handleConnection.bind(this));

        this.connections = [];

        ui.writeLog('Ready to accept WebSocket connections.');
    },

    sendPlayerCount: function (target) {
        var payload = {
            op: opcodes.PLAYER_COUNT,
            count: this.getPlayerCount()
        };

        if (target != null) {
            target.emit('data', payload);
        } else {
            this.broadcast(payload);
        }
    },

    generateClientId: function () {
        return this.idGenerator++;
    },

    broadcast: function (data, source) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (source != null && connection === source) {
                continue;
            }

            try {
                connection.emit('data', data);
            } catch (e) { }
        }
    },

    sendTo: function (connectionId, data) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.id === connectionId) {
                connection.emit('data', data);
                break;
            }
        }
    },

    getConnectionByUid: function (userId) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.authenticated && connection.user.id === userId) {
                return connection;
            }
        }

        return null;
    },

    getPlayerCount: function () {
        var total = 0;
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.authenticated) {
                total++;
            }
        }
        return total;
    },

    handleConnection: function (connection) {
        this.connections.push(connection);

        connection.authenticated = false;
        connection.user = null;

        this.sendPlayerCount(connection);

        connection.on('data', function (d) {
            router.route(this, connection, d);
        }.bind(this));

        connection.on('disconnect', function () {
            // A connection has been closed, look it up in our local copy of active connections.
            // Due to a weird socket.io bug, disconnect is sometimes called twice for the same connection...
            var idx = this.connections.indexOf(connection);

            // If we have found it, then remove it from our collection.
            if (idx >= 0) {
                this.connections.splice(idx, 1);
                net.sendPlayerCount();
            }

            // Try to close this connection if we can, to ensure it really is dead.
            try {
                connection.disconnect();
            } catch (e) { }
        }.bind(this));
    }
};