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
    this.isZombie = false;
    this.outfit = '1';
    this.head = '1';
}

Entity.prototype.isZombie = function () {
    return this.isZombie;
};

Entity.prototype.isNpc = function () {
    return this.connection == null;
};

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
        hm: this.healthMax,
        ob: this.outfit,
        oh: this.head
    };
};

Entity.prototype.getRect = function (overrideX, overrideY) {
    var x = this.posX;
    var y = this.posY;

    if (overrideX != null) {
        x = overrideX;
    }

    if (overrideY != null) {
        y = overrideY;
    }

    var w = 32;
    var h = 32;

    var margin = 6;

    var rect = {
        left: x,
        top: y + 6,
        height: h - margin,
        width: w - margin
    };
    rect.bottom = rect.top + rect.height;
    rect.right = rect.left + rect.width;
    return rect;
};

Entity.prototype.canMoveTo = function (x, y) {
    if (x < 0 || y < 0 || x > this.map.widthPx || y > this.map.heightPx) {
        return false;
    }

    var projectedRect = this.getRect(x, y);

    if (this.map.isRectBlocked(projectedRect, this)) {
        return false;
    }

    // TODO Speedhack check

    return true;
};

module.exports = Entity;