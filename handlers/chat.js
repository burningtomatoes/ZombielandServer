var router = require('../router.js');
var opcodes = require('../opcodes.js');

var Chat = {
    handleMove: function (connection, data) {
        var text = data.txt;

        if (text == null) {
            return;
        }

        text = text.trim();

        if (text.length == 0 || text.length > 255) {
            return;
        }

        net.broadcast({
            op: opcodes.SERVER_CHAT,
            name: connection.user.dbData.username,
            text: text
        });
    }
};

router.register(opcodes.CLIENT_CHAT, Chat.handleMove);