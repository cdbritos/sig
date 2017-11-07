var pointsDB = [];
var userRoutesIdsDB = [];
var routeGraphicsLayer = {};
var eventGraphicsLayer = {};
var map = {}; 
var eventFeatureLayer ={};
var trailFeatureLayer ={};
var routeSelectedId = ''; // Id de ruta selecionado para cargar de nuevo
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search",
  "esri/tasks/Locator",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/tasks/support/Query",
  "dojo/domReady!"
], function(Map, MapView, Search, Locator, FeatureLayer, GraphicsLayer, Graphic, Query){
  map = new Map({
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
  view.ui.remove("zoom");

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
  //Query Para traer eventos
  var query = new Query();
  query.where = "website='www.sig9.com'";
  query.returnGeometry = true;
  eventFeatureLayer.queryFeatures(query).then(function(results){
    pointsDB = results.features;
    displayResultsPoint(results.features);
  });

  //Query para traer las rutas calculadas
  /*var queryRoute = new Query();
  queryRoute.returnIdsOnly = true;
  queryRoute.returnDistinctValues = false;
  queryRoute.returnCountOnly = false
  queryRoute.returnExtentOnly = false
  queryRoute.where = "notes='SIG9'";
  trailFeatureLayer.queryFeatures(queryRoute).then(function(results){
    userRoutesDB = results.features;
    listRoute(userRoutesDB);
  });*/
  var requestUrl = 'http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Recreation/FeatureServer/1/query?where=notes%3D%27SIG9%27&returnIdsOnly=true&f=json';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", requestUrl, false);
  xhr.send(null);
  if (xhr.status === 200) {
    var requestResponse = JSON.parse(xhr.response);
    userRoutesIdsDB = requestResponse.objectIds;
    listRoute(userRoutesIdsDB);
  }




  //Layer de Geometria
  routeGraphicsLayer = new GraphicsLayer();
  eventGraphicsLayer = new GraphicsLayer();
  map.addMany([routeGraphicsLayer, eventGraphicsLayer]);

  view.on("click", function(event){
    if (event.mapPoint.spatialReference.isGeographic) {

    
      
    }
  });

  function listRoute(routeIds) {
    for (var i = 0; i < routeIds.length; i++) {
      var t1 = document.getElementById("routeMenu");
      var inputElement = document.createElement("div");
      inputElement.innerHTML = `<a class="dropdown-item dropdownItem" href="#" id="${routeIds[i]}" onClick="loadRoute(${routeIds[i]})"> ${routeIds[i]} </a>`;
      t1.appendChild(inputElement);
    }
  }

  function displayResultsPoint(results) {
    for (var i=0; i < results.length; i++) {
      var point = {
        type: "point",
        x: results[i].geometry.x,
        y: results[i].geometry.y
      };

      markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      };
      var pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });
      eventGraphicsLayer.add(pointGraphic);

    }
  }
});
