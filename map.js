var ZOMBIE_LIMIT = 20;

function Map(id, nameInternal, namePublic) {
    this.id = id;
    this.nameInternal = nameInternal;
    this.namePublic = namePublic;

    this.clear();
}

Map.prototype.update = function () {
    var zombieCount = this.zombies.length;
    var shouldSpawnZombie = Math.random() <= 0.5;

    if (zombieCount < ZOMBIE_LIMIT && shouldSpawnZombie) {
        var zombie = new Entity();
        zombie.isZombie = true;
        zombie.posX = 25 + (Math.random() * 1000);
        zombie.posY = 25 + (Math.random() * 1000);
        zombie.name = '';
        this.add(zombie);
    }
};

Map.prototype.clear = function () {
    this.entitites = [];
    this.zombies = [];
    this.idGenerator = 0;
};

Map.prototype.generateId = function () {
    return this.idGenerator++;
};

Map.prototype.add = function (entity) {
    entity.map = this;
    entity.id = this.generateId();

    this.entitites.push(entity);

    this.sendEntityAdd(entity);
};

Map.prototype.remove = function (entity) {
    var idx = this.entitites.indexOf(entity);

    if (entity.isPlayer()) {
        entity.connection.user.entity = null;
    }

    if (idx == -1) {
        return false;
    }

    this.entitites.splice(idx, 1);
    this.sendEntityRemove(entity);
};

Map.prototype.broadcast = function (message, ignoreEntity) {
    for (var i = 0; i < this.entitites.length; i++) {
        var entity = this.entitites[i];

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

    for (var i = 0; i < this.entitites.length; i++) {
        var entity = this.entitites[i];
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