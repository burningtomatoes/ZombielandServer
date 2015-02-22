module.exports = {
    maps: [],
    ready: false,

    init: function () {
        this.ready = false;

        db.connection.query('SELECT * FROM maps', function (err, result) {
            this.processMaps(result);
        }.bind(this));
    },

    processMaps: function (dbResult) {
        this.maps = [];

        for (var i = 0; i < dbResult.length; i++) {
            var mapData = dbResult[i];

            var map = new Map(mapData.id, mapData.name_internal, mapData.name_display);
            this.maps.push(map);
        }

        this.ready = true;
        ui.writeLog('Loaded ' + this.maps.length + ' maps.');
    }
};