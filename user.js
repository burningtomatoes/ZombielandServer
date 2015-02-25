function User(connection, dbData) {
    this.id = dbData.id;
    this.connection = connection;
    this.dbData = dbData;
    this.entity = null;
    this.posY = this.dbData.pos_y;
    this.posX = this.dbData.pos_x;
    this.lastMapId = this.dbData.pos_map_id;
    this.outfit = this.dbData.outfit;
    this.head = this.dbData.head;
    this.weapon = this.dbData.weapon;
    this.healthCurrent = this.dbData.health_now;
    this.healthMax = this.dbData.health_max;
}

User.prototype.generateLook = function () {
    var availableHeads = ['1'];
    var availableBodies = ['1', '2'];

    this.head = chance.pick(availableHeads);
    this.outfit = chance.pick(availableBodies);
};

User.prototype.onLogin = function () {
    if (this.lastMapId == null || this.outfit == null || this.head == null) {
        // We are a new (or broken) user, join the initial map
        this.posX = config.startPos.posX;
        this.posY = config.startPos.posY;
        this.lastMapId = config.startPos.map;
        this.healthCurrent = 100;
        this.healthMax = 100;
        this.weapon = 'knife';

        // And generate a random look for us
        this.generateLook();
    }

    this.joinMap(this.lastMapId);
};

User.prototype.removeFromMap = function () {
    if (this.entity != null) {
        this.entity.map.remove(this.entity);
        this.entity = null;
    }
};

User.prototype.createEntity = function () {
    var entity = new Entity(this.connection, this.dbData.username);
    entity.posX = this.posX;
    entity.posY = this.posY;
    entity.head = this.head;
    entity.outfit = this.outfit;
    entity.healthCurrent = this.healthCurrent;
    entity.healthMax = this.healthMax;
    entity.weapon = this.weapon;
    return entity;
};

User.prototype.joinMap = function (id) {
    this.removeFromMap();

    var map = mapManager.getMap(id);

    if (map != null) {
        var playerEntity = this.createEntity();
        playerEntity.joining = true;

        this.entity = playerEntity;

        map.add(playerEntity);

        this.connection.emit('data', {
            op: opcodes.LOAD_MAP,
            m: map.nameInternal
        });

        this.saveToDb();
        return true;
    }

    return false;
};

User.prototype.onDisconnect = function () {
    this.saveToDb();
    this.removeFromMap();
};

User.prototype.saveToDb = function () {
    if (this.entity == null) {
        return;
    }

    this.posX = this.entity.posX;
    this.posY = this.entity.posY;
    this.lastMapId = this.entity.map.id;

    var updateObject = {
        pos_map_id: this.lastMapId,
        pos_x: this.posX,
        pos_y: this.posY,
        outfit: this.outfit,
        head: this.head,
        health_now: this.healthCurrent,
        health_max: this.healthMax,
        weapon: this.weapon
    };

    db.connection.query('UPDATE players SET ? WHERE id = ? LIMIT 1', [updateObject, this.dbData.id]);
};

module.exports = User;