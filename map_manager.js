var request = require('request');

module.exports = {
    maps: [],
    ready: false,
    pendingLoads: 0,

    init: function () {
        this.ready = false;

        db.connection.query('SELECT * FROM maps', function (err, result) {
            this.processMaps(result);
        }.bind(this));

        setInterval(this.updateMaps.bind(this), 1000);
    },

    updateMaps: function () {
        for (var i = 0; i < this.maps.length; i++) {
            var map = this.maps[i];
            map.update();
        }
    },

    processMaps: function (dbResult) {
        this.maps = [];

        for (var i = 0; i < dbResult.length; i++) {
            var mapData = dbResult[i];

            var map = new Map(mapData.id, mapData.name_internal, mapData.name_display);
            this.maps.push(map);

            this.pendingLoads++;

            var targetUri = config.mapRepo + '/' + mapData.name_internal + '.json';
            request.get(targetUri, this.processMapData.bind(this, map));
        }

        this.ready = true;
        ui.writeLog('Preparing ' + this.maps.length + ' maps...');
    },

    processMapData: function (map, error, response, body) {
        if (body == null) {
            ui.writeLog('[!!!] GAME NOT INITIALIZED - MAP LOAD FAILED: ' + map.nameInternal);
            return;
        }

        this.pendingLoads--;

        var data = JSON.parse(body);
        map.layers = data.layers;
        map.widthTiles = data.width;
        map.heightTiles = data.height;
        map.widthPx = data.width * config.TileSize;
        map.heightPx = data.height * config.TileSize;

        // Prepare blockmap
        map.blockedRects = [];

        var layerCount = map.layers.length;

        for (var i = 0; i < layerCount; i++) {
            var layer = map.layers[i];

            if (layer.properties == null) {
                layer.properties = {};
            }

            var x = -1;
            var y = 0;

            var isBlocking = layer.properties.blocked == '1';

            var layerDataLength = layer.data.length;

            for (var tileIdx = 0; tileIdx < layerDataLength; tileIdx++) {
                var tid = layer.data[tileIdx];

                x++;

                if (x >= map.widthTiles) {
                    y++;
                    x = 0;
                }

                if (tid === 0) {
                    // Invisible (no tile set for this position; so not blocked)
                    continue;
                }

                var rect = {
                    top: y * config.TileSize,
                    left: x * config.TileSize,
                    width: config.TileSize,
                    height: config.TileSize
                };
                rect.bottom = rect.top + rect.height;
                rect.right = rect.left + rect.width;

                if (isBlocking) {
                    map.blockedRects.push(rect);
                }
            }
        }

        if (this.pendingLoads <= 0) {
            this.ready = true;
            ui.writeLog('All maps have been loaded succesfully. Now accepting logins.');
        }
    },

    getMap: function (id) {
        for (var i = 0; i < this.maps.length; i++) {
            var map = this.maps[i];

            if (map.id === id) {
                return map;
            }
        }

        return null;
    }
};