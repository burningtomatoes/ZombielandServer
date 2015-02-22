var router = require('../router.js');
var opcodes = require('../opcodes.js');

var Login = {
    sendErrorResponse: function (connection, error) {
        var data = {
            op: opcodes.LOGIN_RESULT_ERROR,
            msg: error
        };

        connection.emit('data', data);
    },

    sendCompleteResponse: function (connection, userObj) {
        var data = {
            op: opcodes.LOGIN_RESULT_SUCCESS,
            user: {
                id: userObj.id,
                username: userObj.username
            }
        };

        connection.emit('data', data);
    },

    handleLogin: function (connection, data) {
        if (connection.authenticated) {
            return;
        }

        var username = data.username.trim();
        var password = data.password;

        if (username == null || password == null || username.length < 0 || username.length > 16 || password.length != 40) {
            // Invalid data
            return;
        }

        if (!mapManager.ready) {
            Login.sendErrorResponse(connection, 'The world is still starting up, one minute please...');
            return;
        }

        db.connection.query('SELECT * FROM players WHERE username = ? LIMIT 1', [data.username], function (err, result) {
            if (result.length == 1) {
                // User already exists, we are running a log in attempt
                var user = result[0];

                if (user.password !== password) {
                    Login.sendErrorResponse(connection, 'Invalid password; this name is already registered.');
                    return;
                }

                if (user.banned) {
                    Login.sendErrorResponse(connection, 'You have been banned.');
                    return;
                }

                Login.completeAuthentication(connection, user);
            } else {
                Login.createUser(connection, data.username, data.password);
            }
        });
    },

    createUser: function (connection, username, password) {
        var now = new Date();

        var createObj = {
            username: username,
            password: password,
            date_created: now,
            date_last_login: now
        };

        db.connection.query('INSERT INTO players SET ?', createObj, function (err, result) {
            var insertId = result.insertId;

            db.connection.query('SELECT * FROM players WHERE id = ?', [insertId], function (err, result) {
                Login.completeAuthentication(connection, result[0])
            });
        });
    },

    completeAuthentication: function (connection, userObj) {
        ui.writeLog('Connection ' + connection.id + ' has ' + (userObj.pos_map_id == null ? 'registered' : 'logged in') + ' as ' + userObj.username + ' (#' + userObj.id + ').');

        // Disconnect old connections as the same user (prevent double login)
        var oldConnection = net.getConnectionByUid(userObj.id);

        if (oldConnection != null) {
            ui.writeLog('Disconnecting old connection ' + oldConnection.id + ' authenticated as user ' + userObj.id + '...');
            oldConnection.disconnect();
        }

        // Mark this connection as authenticated
        connection.authenticated = true;
        connection.user = new User(connection, userObj);

        // Update the last_login timestamp
        db.connection.query('UPDATE players SET date_last_login = ? WHERE id = ?', [new Date(), userObj.id]);

        // Send the OK response so the client will join the game properly now
        this.sendCompleteResponse(connection, userObj);

        // Broadcast new player count to the world
        net.sendPlayerCount();

        // Let the User class handle the next steps
        connection.user.onLogin();
    }
};

router.register(opcodes.LOGIN, Login.handleLogin);