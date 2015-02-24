function Entity(connection, name) {
    this.id = null;
    this.name = name == null || name.length == 0 ? '???' : name;
    this.connection = connection;
    this.posX = 0;
    this.posY = 0;
    this.map = null;
    this.moving = false;
    this.rotation = 0;
    this.healthCurrent = 100;
    this.healthMax = 100;
    this.joining = false;
}

Entity.prototype.isPlayer = function () {
    return this.connection != null;
};

Entity.prototype.serialize = function () {
    return {
        id: this.id,
        uid: this.isPlayer() ? this.connection.user.id : 0,
        ip: this.isPlayer ? 1 : 0,
        pX: this.posX,
        pY: this.posY,
        pR: this.rotation,
        nm: this.name,
        hc: this.healthCurrent,
        hm: this.healthMax
    };
};

Entity.prototype.canMoveTo = function (x, y) {
    if (x < 0 || y < 0) {
        // Can not move outside map top bounds
        console.log('block move: x or y lower than zero');
        return true;
    }

    // TODO Speedhack check
    // TODO SS Collision detection with map features (not entities, no time for that shit)
    // TODO SS Map outer boundary detection

    return true;
};

module.exports = Entity;