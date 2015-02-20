var nodeStatic = require('node-static');
var http = require('http');
var file = new (nodeStatic.Server)();
var ui = require('./ui.js');
var config = require('./config.js');

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

    generateClientId: function () {
        return this.idGenerator++;
    },

    broadcast: function (op, data, source) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection == source) {
                continue;
            }

            try {
                connection.emit(op, data);
            } catch (e) { }
        }
    },

    sendTo: function (connectionId, op, data) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.id === connectionId) {
                connection.emit(op, data);
                break;
            }
        }
    },

    handleConnection: function (connection) {
        this.connections.push(connection);

        connection.didHandshake = false;
        connection.connectionId = null;
        connection.isHost = false;

        connection.on('handshake', function () {
            if (connection.didHandshake) {
                return;
            }

            connection.connectionId = this.generateClientId();

            ui.writeLog('Session #' + connection.connectionId + ' has signed in to matchmaking service');

            connection.emit('handshake', {
                motd: config.motd,
                id: connection.connectionId
            });

            connection.didHandshake = true;
        }.bind(this));

        connection.on('disconnect', function () {
            if (connection.connectionId != null) {
                ui.writeLog('Session #' + connection.connectionId + ' has disconnected');
            }

            var idx = this.connections.indexOf(connection);
            this.connections.splice(idx, connection);
        }.bind(this));

        connection.on('offer', function (offer) {
            if (!connection.didHandshake || offer == null) {
                connection.disconnect();
                return;
            }

            ui.writeLog('Client #' + connection.connectionId + ' is looking for a game...anyone here?');

            this.broadcast('offer', {
                connectionId: connection.id,
                offer: offer
            }, connection);
        }.bind(this));

        connection.on('answer', function (answer) {
            if (!connection.didHandshake || answer == null || answer.connectionId == null || answer.answer == null) {
                connection.disconnect();
                return;
            }

            ui.writeLog('Client #' + connection.connectionId + ' wants to host #' + answer.connectionId);

            this.sendTo(answer.connectionId, 'answer', {
                connectionId: connection.id,
                answer: answer.answer
            });
        }.bind(this));

        connection.on('ice', function (candidate) {
            if (!connection.didHandshake || candidate == null || candidate.connectionId == null || candidate.candidate == null) {
                connection.disconnect();
                return;
            }

            ui.writeLog('Client #' + connection.connectionId + ' sending ICE candidate to #' + candidate.connectionId);

            this.sendTo(candidate.connectionId, 'ice', {
                connectionId: connection.id,
                candidate: candidate.candidate
            });
        }.bind(this));
    }
};