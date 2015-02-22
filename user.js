function User(connection, dbData) {
    this.connection = connection;
    this.dbData = dbData;
    this.entity = null;
    this.posY = this.dbData.pos_y;
    this.posX = this.dbData.pos_x;
    this.lastMapId = this.dbData.pos_map_id;
}

User.prototype.onLogin = function () {
    if (this.lastMapId == null) {
        // We are a new (or broken) user, join the initial map
        this.posX = config.startPos.posX;
        this.posY = config.startPos.posY;
        this.lastMapId = config.startPos.map;
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
    var entity = new Entity(this.connection);
    entity.posX = this.posX;
    entity.posY = this.posY;
    return entity;
};

User.prototype.joinMap = function (id) {
    this.removeFromMap();

    var map = mapManager.getMap(id);

    if (map != null) {
        var playerEntity = this.createEntity();
        this.entity = playerEntity;

        map.add(playerEntity);

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
        pos_y: this.posY
    };

    db.connection.query('UPDATE players SET ? WHERE id = ? LIMIT 1', [updateObject, this.dbData.id]);
};

module.exports = User;