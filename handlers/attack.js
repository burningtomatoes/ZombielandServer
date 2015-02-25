var router = require('../router.js');
var opcodes = require('../opcodes.js');

var Attack = {
    handleAttack: function (connection, data) {
        var entity = connection.user.entity;

        if (entity == null || entity.joining || !entity.isPlayer()) {
            return;
        }

        entity.broadcastAttack();
    }
};

router.register(opcodes.CLIENT_ATTACK, Attack.handleAttack);