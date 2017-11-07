var token = 'MpfnmcW5StjhXyBEs0y1VXSOsOVvgrRRSE5SqkzW_xrS9e7rkBwLy7dctCOSyeTaPavJpCdhBSsGatzd_CcY4rXS32ukm9Q0EXlnbj317LpV8ct4qGVbHo-hmychbwxL6W2aKv8HaUiBkleUI885lA..';

var pointsDB = [];
var userRoutesIdsDB = [];
var routeGraphicsLayer = {};
var eventGraphicsLayer = {};
var map = {}; 
var eventFeatureLayer ={};
var trailFeatureLayer ={};
var routeLyr = {};
var routeSelectedId = ''; // Id de ruta selecionado para cargar de nuevo
var spatialReference = 3857;
var routeParams = {};
var routeTask = {};

// Define the symbology used to display the stops
var stopSymbol = {
  type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
  style: "cross",
  size: 15,
  outline: { // autocasts as new SimpleLineSymbol()
    width: 4
  }
};

// Define the symbology used to display the route
var routeSymbol = {
  type: "simple-line", // autocasts as SimpleLineSymbol()
  color: [0, 0, 255, 0.5],
  width: 5
};


require([
  "esri/Map",
  "esri/views/MapView",
  "esri/tasks/Locator",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/tasks/RouteTask",
  "esri/tasks/support/RouteParameters",
  "esri/tasks/support/FeatureSet",
  "esri/core/urlUtils",
  "esri/Graphic",
  "esri/tasks/support/Query",
  "dojo/on",
  "dojo/domReady!"
], function(Map, MapView, Locator, FeatureLayer, GraphicsLayer, RouteTask, RouteParameters, FeatureSet, urlUtils, Graphic, Query, on){


		// Proxy the route requests to avoid prompt for log in
   	urlUtils.addProxyRule({
        urlPrefix: "route.arcgis.com",
        proxyUrl: "https://utility.arcgis.com/usrsvcs/appservices/iObM905Ho9Xw5yaS/rest/services/World/Route/NAServer/Route_World/solve"
      });

		// Point the URL to a valid route service
      routeTask = new RouteTask({
        url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve??token=ZTe6f3P6_Y7SlBOqNN8FS4HKijCWGhJXgtEYC7BArYYJ-Y-neWzxdyRGEzT6RV6IQYx4vLGA1qMh_iFzyyNBIRcBXlPGY5bQzINHYzc9ZP7f7Ysa-ZksClCOEt9TreChymHIiTCUxsPBaIpGdEszEg.." 
      });

	// The stops and route result will be stored in this layer
      routeLyr = new GraphicsLayer();      

	// Setup the route parameters
      routeParams = new RouteParameters({
        stops: new FeatureSet(),
		  preserveFirstStop: true,
		  preserveLastStop: true,
		  findBestSequence: true,
        outSpatialReference: { // autocasts as new SpatialReference()
          wkid: spatialReference
        }
      });

	

  var map = new Map({
    basemap: "streets-vector"
  });

  eventFeatureLayer = new FeatureLayer({
    url: "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0"
  });

  trailFeatureLayer = new FeatureLayer({
    url: "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Recreation/FeatureServer/1"
  });
  var view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 3.5,
    center: [-119.417931, 36.778259] 
  });
//  view.ui.remove("zoom");

	// Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
   //   on(view, "click", addStop);

  var source = [
    {
      locator: new Locator({ url: "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer" }),
      singleLineFieldName: "SingleLine",
      outFields: ["Addr_type"],
      name: "prueba",
      localSearchOptions: {
        minScale: 300000,
        distance: 50000
      },
      placeholder: "Direccion o Lugar",
      resultSymbol: {
         type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
         url: "./location.png",
         size: 24,
         width: 24,
         height: 24,
         xoffset: 0,
         yoffset: 15
      },
      countryCode: "US"
    }
  ]

  //Layer de Geometria
  eventGraphicsLayer = new GraphicsLayer();

  map.addMany([eventGraphicsLayer,routeLyr]);
});
