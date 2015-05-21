WMSURL = "http://localhost:8080/geoserver/wms?";

customParams = [
	"FORMAT=image/png",
	"LAYERS=opengeo:us_zipcode",
	"SRS=EPSG:900913"
];

tileSize = 256;

wmsStandardParams = [
	"REQUEST=GetMap",
	"SERVICE=WMS",
	"VERSION=1.1.1",
	"BGCOLOR=0xFFFFFF",
	"TRANSPARENT=TRUE",
	"WIDTH="+ tileSize,
	"HEIGHT="+ tileSize
];

queryParams = [
	"REQUEST=GetFeatureInfo",
	"QUERY_LAYERS=opengeo:us_zipcode",
	"INFO_FORMAT=application/json",
	"LAYERS=usa:us_zipcode",
	"SRS=EPSG:900913",
	"SERVICE=WMS",
	"VERSION=1.1.1",
	"WIDTH="+ tileSize,
	"HEIGHT="+ tileSize
]