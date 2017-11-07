var responseRoute = {};

function getStops() {
  stops = '';
  sortArray = document.getElementById("sortable").childNodes;
  if (sortArray[0].nodeName == '#text') {
    sortArray = [].slice.call(sortArray, 1);;
  }
  for (var i =0; i < sortArray.length; i++) {
    var textString = sortArray[i].children[0].children[0].children[1].innerText;
    var dir = directions.find((direccion) => {
      return direccion.attribute === textString;
    })
    stops = stops + `${dir.location.x},${dir.location.y};`
  }
  return stops.slice(0, stops.length-1);
  
}

function getRoute() {
  routeGraphicsLayer.removeAll();
  var request = new XMLHttpRequest();
  var requestUrl = "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?f=json"
  var token = 'yv-FAaJFhgseUB8u4q1A2FXEZwg2_CSgWDr-jDAAcOB989SvIhSZzXYWwHZMU2QEySMVTdEAppDQfjOPhDfbC7F4Zy-dz_m1XRKBPWEB0atrDInB6ew4_gOxcgWKhRxN3yxBXoJJAX-_Cy_qljWSxQ..';
  var stops = getStops();
  requestUrl = requestUrl + `&token=${token}&stops=${stops}`;
  request.open('GET', requestUrl, false);  // `false` makes the request synchronous
  request.send(null);

  if (request.status === 200) {
    responseRoute = JSON.parse(request.response);
    if (typeof(JSON.parse(request.response).error) === "object") {
      alert('Refrescar Token!');
    } else {
      responseRoute = responseRoute.routes.features[0].geometry.paths;
      persistPolylineData(responseRoute);
      addRoute();
    }
  }
}


function persistPolylineData(direction) {
  var atributos = {};
  atributos.notes = "SIG9";
  atributos.recordedon = Date.now();
  var geometry = {};
  geometry.paths = direction;
  var addData = {};
  addData.geometry = geometry;
  addData.attributes = atributos;
  var params = `adds=${JSON.stringify([addData])}&f=json`;
  var request = new XMLHttpRequest();
  var requestUrl = "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Recreation/FeatureServer/1/applyEdits"
  request.open('POST', requestUrl, false); 
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(params);

  if (request.status === 200) {
    var persistResponse = JSON.parse(request.response);
    persistData(persistResponse.addResults[0].objectId);
  }
}

function addRoute() {
  require([
    "esri/Graphic",
    "dojo/domReady!"
], function(Graphic){
  var polyline = {
    type: "polyline", 
    paths: responseRoute
  };
  var lineSymbol = {
    type: "simple-line",
    color: [226, 119, 40],
    width: 4
  };
  var polylineGraphic = new Graphic({
    geometry: polyline,
    symbol: lineSymbol
  });
  routeGraphicsLayer.add(polylineGraphic);
});
}
