function Entity(connection) {
    this.id = null;
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
        uid: this.isPlayer() ? this.connection.user.id : 0,
        ip: this.isPlayer ? 1 : 0,
        pX: this.posX,
        pY: this.posY
    };
};

module.exports = Entity;