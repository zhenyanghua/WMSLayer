/* 
    Document   	: vars.js

	Created on : 18 Nov 2012
	Authored by	: "Sean Maday <seanmaday@gmail.com>"

*/

//Be sure to end the WMS URL with a question mark!!!

WMSURL = "https://earthbuilder.google.com/08112974690991164587-15168062796281443125-4/wms/?"

customParams = [
	"FORMAT=image/png",
	"LAYERS=08112974690991164587-04671114157332300863-4",
	"SRS=EPSG:900913",
	"EXCEPTIONS=application%2Fvnd.ogc.se_inimage"
];

tileHeight = 256;
tileWidth = 256;

wmsStandardParams = [
	"REQUEST=GetMap",
	"SERVICE=WMS",
	"VERSION=1.1.1",
	"BGCOLOR=0xFFFFFF",
	"TRANSPARENT=TRUE",
	"WIDTH="+ tileWidth,
	"HEIGHT="+ tileHeight
];
