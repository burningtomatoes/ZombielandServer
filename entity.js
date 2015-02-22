function Entity(id, connection) {
    this.id = id;
    this.connection = connection;
    this.posX = 0;
    this.posY = 0;
    this.map = null;
}

Entity.prototype.isPlayer = function () {
    return this.connection != null;
};

Entity.prototype.serialize = function () {
    return {
        id: this.id,
        ip: this.isPlayer ? 1 : 0,
        pX: this.posX,
        pY: this.posY
    };
};

module.exports = Entity;