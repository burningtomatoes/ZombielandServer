var router = require('../router.js');
var opcodes = require('../opcodes.js');

var MovementUpdate = {
    handleMove: function (connection, data) {
        var entity = connection.user.entity;

        if (entity == null || entity.id !== data.i || !entity.isPlayer()) {
            return;
        }

        var reqX = parseInt(data.x);
        var reqY = parseInt(data.y);

        if (!entity.canMoveTo(reqX, reqY)) {
            entity.moving = false;
        } else {
            entity.posX = reqX;
            entity.posY = reqY;
            entity.moving = data.m == 1;
        }

        var reqRotation = parseInt(data.r);

        if (reqRotation >= 0 && reqRotation <= 360) {
            entity.rotation = reqRotation;
        }

        entity.map.broadcast({
            op: opcodes.SERVER_MOVE_UPDATE,
            i: entity.id,
            x: entity.posX,
            y: entity.posY,
            r: entity.rotation,
            m: entity.moving ? 1 : 0
        });
    }
};

router.register(opcodes.CLIENT_MOVE_UPDATE, MovementUpdate.handleMove);