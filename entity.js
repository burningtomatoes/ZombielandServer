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
    this.movementSpeed = 2;
    this.movementStart = 0;
    this.weapon = null;

    this.aiAction = 'none';
}

Entity.prototype.update = function () {
    var sendMovementUpdate = false;

    // Update player positioning
    if (this.moving) {
        var timeSinceUpdate = Date.now() - this.movementStart;
        timeSinceUpdate /= 1000;

        var framesPassed = timeSinceUpdate * 60;

        var xChange = this.movementSpeed * Math.cos(this.rotation * Math.PI / 180);
        var yChange = this.movementSpeed * Math.sin(this.rotation * Math.PI / 180);

        xChange *= framesPassed;
        yChange *= framesPassed;

        var targetX = this.posX + xChange;
        var targetY = this.posY + yChange;

        if (!this.canMoveTo(targetX, targetY)) {
            this.isMoving = false;
        } else {
            this.posX += xChange;
            this.posY += yChange;
        }

        this.movementStart = Date.now();
        sendMovementUpdate = true;
    }

    // Zombie AI
    if (this.isZombie) {
        if (chance.bool()) {
            this.rotation += chance.integer({ min: -32, max: 32 });

            sendMovementUpdate = true;
        }

        if (!this.moving && chance.bool()) {
            this.moving = true;
            this.movementStart = Date.now();

            sendMovementUpdate = true;
        }
        else if (this.moving && chance.bool()) {
            this.moving = false;
            sendMovementUpdate = true;
        }

        var infLoopPrevention = 100;
        var wiggleDirectionDown = chance.bool();
        while (this.moving && !this.canMoveInDirection(this.rotation, 120) && infLoopPrevention > 0) {
            if (wiggleDirectionDown) {
                this.rotation += chance.integer({ min: -32, max: 0 });
            } else {
                this.rotation += chance.integer({ min: 0, max: 32 });
            }

            infLoopPrevention--;
        }
    }

    // Round off rotation
    if (this.rotation < 0) {
        this.rotation += 360;
    }

    if (this.rotation > 360) {
        this.rotation -= 360;
    }

    // Net sync movement
    if (sendMovementUpdate) {
        this.broadcastMovementUpdate();
    }
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
        oh: this.head,
        wp: this.weapon
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

Entity.prototype.canMoveInDirection = function (direction, range) {
    var xChange = this.movementSpeed * Math.cos(direction * Math.PI / 180);
    var yChange = this.movementSpeed * Math.sin(direction * Math.PI / 180);

    xChange *= range;
    yChange *= range;

    return this.canMoveTo(this.posX + xChange, this.posY + yChange);
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

Entity.prototype.broadcastMovementUpdate = function () {
    this.map.broadcast({
        op: opcodes.SERVER_MOVE_UPDATE,
        i: this.id,
        x: this.posX,
        y: this.posY,
        r: this.rotation,
        m: this.moving ? 1 : 0
    });
};

Entity.prototype.broadcastAttack = function () {
    this.map.broadcast({
        op: opcodes.SERVER_ATTACK,
        i: this.id
    });
};

module.exports = Entity;