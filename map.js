var ZOMBIE_LIMIT = 20;

function Map(id, nameInternal, namePublic) {
    this.id = id;
    this.nameInternal = nameInternal;
    this.namePublic = namePublic;
    this.widthTiles = 0;
    this.heightTiles = 0;
    this.widthPx = 0;
    this.heightPx = 0;
    this.blockedRects = [];
    this.entities = [];

    this.clear();
}

Map.prototype.update = function () {
    var zombieCount = this.zombies.length;
    var shouldSpawnZombie = chance.bool();

    if (zombieCount < ZOMBIE_LIMIT && shouldSpawnZombie) {
        var zombie = new Entity();
        zombie.isZombie = true;

        zombie.posX = chance.integer({ min: 1, max: this.widthPx });
        zombie.posY = chance.integer({ min: 1, max: this.heightPx });
        zombie.rotation = chance.integer({ min: 0, max: 360 });
        zombie.head = 'z_1';
        zombie.outfit = 'z_1';
        zombie.name = '';

        if (!this.isRectBlocked(zombie.getRect(), zombie)) {
            this.zombies.push(zombie);
            this.add(zombie);
        }
    }
};

Map.prototype.isRectBlocked = function (ourRect,  ignoreEntity) {
    var blockedRectsLength = this.blockedRects.length;

    for (var i = 0; i < blockedRectsLength; i++) {
        if (Utils.rectIntersects(ourRect, this.blockedRects[i])) {
            return true;
        }
    }

    var entitiesLength = this.entities.length;

    for (var k = 0; k < entitiesLength; k++) {
        var entity = this.entities[k];

        if (!entity.causesCollision || entity === ignoreEntity) {
            continue;
        }

        var theirRect = entity.getRect();

        if (Utils.rectIntersects(ourRect, theirRect)) {
            return true;
        }
    }

    return false;
};

Map.prototype.clear = function () {
    this.entities = [];
    this.zombies = [];
    this.idGenerator = 0;
};

Map.prototype.generateId = function () {
    return this.idGenerator++;
};

Map.prototype.add = function (entity) {
    entity.map = this;
    entity.id = this.generateId();

    this.entities.push(entity);

    this.sendEntityAdd(entity);
};

Map.prototype.remove = function (entity) {
    var idx = this.entities.indexOf(entity);

    if (entity.isPlayer()) {
        entity.connection.user.entity = null;
    }

    if (idx == -1) {
        return false;
    }

    this.entities.splice(idx, 1);
    this.sendEntityRemove(entity);
};

Map.prototype.broadcast = function (message, ignoreEntity) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        if (ignoreEntity != null && entity === ignoreEntity) {
            continue;
        }

        if (entity.isPlayer()) {
            entity.connection.emit('data', message);
        }
    }
};

Map.prototype.sendEntityList = function (connectionTarget) {
    var payload = {
        op: opcodes.ENTITY_LIST,
        e: []
    };

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        payload.e.push(entity.serialize());
    }

    connectionTarget.emit('data', payload);
};

Map.prototype.sendEntityAdd = function (entity) {
    var payload = {
        op: opcodes.ENTITY_ADD,
        e: entity.serialize()
    };

    this.broadcast(payload, entity);
};

Map.prototype.sendEntityRemove = function (entity) {
    var payload = {
        op: opcodes.ENTITY_REMOVE,
        i: entity.id
    };

    this.broadcast(payload, entity);
};

module.exports = Map;