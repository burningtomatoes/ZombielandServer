var router = require('../router.js');
var opcodes = require('../opcodes.js');

var MapLoaded = {
    handleEvent: function (connection, data) {
        var entity = connection.user.entity;

        if (entity == null || !entity.joining) {
            return;
        }

        entity.joining = false;
        entity.map.sendEntityList(connection);
    }
};

router.register(opcodes.MAP_LOADED, MapLoaded.handleEvent);