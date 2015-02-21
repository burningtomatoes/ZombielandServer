var router = require('../router.js');
var opcodes = require('../opcodes.js');

var Login = {
    sendResponse: function (connection, error) {
        var data = {
            op: opcodes.LOGIN_RESULT,
            msg: error
        };

        net.sendTo(connection.id, data);
    },

    handleLogin: function (connection, data) {
        var username = data.username;
        var password = data.password;

        if (username == null || password == null || username.length < 0 || username.length > 16 || password.length != 40) {
            // Invalid data
            return;
        }

        db.connection.query('SELECT * FROM players WHERE username = ? LIMIT 1', [data.username], function (err, result) {
            if (result.length == 1) {
                // User already exists, we are running a log in attempt
                var user = result[0];

                if (user.password !== password) {
                    Login.sendResponse(connection, 'Invalid password.');
                    return;
                }

                if (user.banned) {
                    Login.sendResponse(connection, 'You have been banned.');
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
        ui.writeLog('Connection ' + connection.id + ' has authenticated as ' + userObj.username + '.');

        this.sendResponse(connection, 'You win.');

        connection.authenticated = true;
        connection.user = userObj;
    }
};

router.register(opcodes.LOGIN, Login.handleLogin);