function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    var MERCATOR_RANGE = 256;
    this.pixelOrigin_ = new google.maps.Point(
        MERCATOR_RANGE / 2, MERCATOR_RANGE / 2);
    this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
    this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
};

MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
    var me = this;

    var point = opt_point || new google.maps.Point(0, 0);

    var origin = me.pixelOrigin_;
    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189.  This is about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

MercatorProjection.prototype.fromDivPixelToLatLng = function(pixel, zoom) {
    var me = this;

    var origin = me.pixelOrigin_;
    var scale = Math.pow(2, zoom);
    var lng = (pixel.x / scale - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (pixel.y / scale - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

MercatorProjection.prototype.fromDivPixelToSphericalMercator = function(pixel, zoom) {
    var me = this;
    var coord = me.fromDivPixelToLatLng(pixel, zoom);

    var r= 6378137.0;
    var x = r* degreesToRadians(coord.lng());
    var latRad = degreesToRadians(coord.lat());
    var y = (r/2) * Math.log((1+Math.sin(latRad))/ (1-Math.sin(latRad)));

    return new google.maps.Point(x,y);
};
MercatorProjection.prototype.fromLatLngToSphericalMercator = function(coord) {
    var r= 6378137.0;
    var x = r* degreesToRadians(coord.lng());
    var latRad = degreesToRadians(coord.lat());
    var y = (r/2) * Math.log((1+Math.sin(latRad))/ (1-Math.sin(latRad)));

    return new google.maps.Point(x,y);
};

function loadWMS(map, baseURL, customParams) {
    var isPng = true;
    var minZoomLevel = 2;
    var maxZoomLevel = 28;

    //add additional parameters
    var wmsParams = wmsStandardParams.concat(customParams);

    var overlayOptions = {
        getTileUrl: function(coord, zoom) {
            var lULP = new google.maps.Point(coord.x*256,(coord.y+1)*256);
            var lLRP = new google.maps.Point((coord.x+1)*256,coord.y*256);

            var projectionMap = new MercatorProjection();

            var lULg = projectionMap.fromDivPixelToSphericalMercator(lULP, zoom);
            var lLRg  = projectionMap.fromDivPixelToSphericalMercator(lLRP, zoom);

            var lUL_Latitude = lULg.y;
            var lUL_Longitude = lULg.x;
            var lLR_Latitude = lLRg.y;
            var lLR_Longitude = lLRg.x;
            //GJ: there is a bug when crossing the -180 longitude border (tile does not render) - this check seems to fix it
            if (lLR_Longitude < lUL_Longitude) {
              lLR_Longitude = Math.abs(lLR_Longitude);
            }
            var urlResult = baseURL + wmsParams.join("&") + "&bbox=" + lUL_Longitude + "," + lUL_Latitude + "," + lLR_Longitude + "," + lLR_Latitude;
            return urlResult;
        },

        tileSize: new google.maps.Size(tileSize, tileSize),

        minZoom: minZoomLevel,
        maxZoom: maxZoomLevel,
        opacity: 1,
        isPng: isPng
    };

    overlayWMS = new google.maps.ImageMapType(overlayOptions);

    //map.overlayMapTypes.insertAt(0, overlayWMS);
	map.overlayMapTypes.setAt(0, overlayWMS);
}

function getFeatureInfo(e) {
    
    var numTiles = 1 << map.getZoom();
    var projection = new MercatorProjection();
    var worldCoordinate = projection.fromLatLngToPoint(e.latLng);
    var pixelCoordinate = new google.maps.Point(
        worldCoordinate.x * numTiles,
        worldCoordinate.y * numTiles);
    var tileCoordinate = new google.maps.Point(
        Math.floor(pixelCoordinate.x / tileSize),
        Math.floor(pixelCoordinate.y / tileSize));

    // Get the Pixel Postion in a tile
    var tilePixel = new google.maps.Point(
        Math.floor(pixelCoordinate.x % tileSize),
        Math.floor(pixelCoordinate.y % tileSize)
        );

    // get the extent of the tile
    var minPixelX = pixelCoordinate.x - tilePixel.x;
    var minPixelY = pixelCoordinate.y - tilePixel.y;
    var maxPixelX = minPixelX + tileSize;
    var maxPixelY = minPixelY + tileSize;

    //  get Southwest and Northeast corner in Pixel
    var pixelSW = new google.maps.Point(minPixelX / numTiles, maxPixelY / numTiles);
    var pixelNE = new google.maps.Point(maxPixelX / numTiles, minPixelY / numTiles);
    
    // Convert two corners to LatLng
    var sw = projection.fromPointToLatLng(pixelSW);
    var ne = projection.fromPointToLatLng(pixelNE);

    // Convert two corners from WGS84 (degree) tp ShepricalMercator (meter)
    var SW_SphericalMercator = projection.fromLatLngToSphericalMercator(sw);
    var NE_SphericalMercator = projection.fromLatLngToSphericalMercator(ne);

    // Get the minX, minY, maxX & maxY for the bbox
    var minX = SW_SphericalMercator.x;
    var minY = SW_SphericalMercator.y;
    var maxX = NE_SphericalMercator.x;
    var maxY = NE_SphericalMercator.y;

    var tileBBox = "&bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
    var queryURL = WMSURL + queryParams.join('&') + tileBBox + '&X=' + tilePixel.x + '&Y=' + tilePixel.y;
    
    return queryURL;
    
}
