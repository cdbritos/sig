
var directions = []; //Guarda las direcciones que fueron ingresados. Campos = {location:{x,y}, attribute: {...}}
var response = {}; // Campos = {location:{x,y}, attribute: {...}}

function search() {
    address = document.getElementById("searchTxt").value;
    var requestUrl = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&sourceCountry=USA&countryCode=USA&maxLocations=1&outFields=*";
    
    requestUrl = `${requestUrl}&SingleLine=${address}`;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl, true);
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          response = JSON.parse(xhr.response);
          var fromData = {};
          fromData.location = response.candidates[0].location;
          fromData.attribute = response.candidates[0].address;
          directions.push(fromData);
          if (response.candidates.length == 0) {
            alert("No se encontró la dirección ingresada")
          } else {
            response = fromData;
            //persistData(response);
            appendHTML(fromData, directions.length);
          }
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);

    return false;
}

function persistData(routeId) {
  for (var i = 0; i < directions.length; i++) {
    var atributos = {};
    var addData = {};
    addData.geometry = directions[i].location;
    atributos.description = directions[i].attribute;
    atributos.website = 'www.sig9.com';
    atributos.eventid = routeId;
    addData.attributes = atributos;
    var params = `adds=${JSON.stringify([addData])}&f=json`;
    var request = new XMLHttpRequest();
    var requestUrl = "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0/applyEdits"
    request.open('POST', requestUrl, false); 
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send(params);

    if (request.status === 200) {
      addResult = JSON.parse(request.response);
    }
  }
}

function appendHTML(direction, index) {
    var t1 = document.getElementById("sortable");
    var d = document.createElement("div");
    d.innerHTML = 
     '<li class="ui-state-default directionContainer">'+
        '<div class="collapseHeader">' +
          `<img class="dragIcon" src="three.png"  data-toggle="collapse" href="#collapseElem${index}" data-target="#collapseElem${index}" data-parent="#sortable" aria-controls="collapseExample" aria-expanded="false"/>` +
          '<span>' + direction.attribute + '</span>' +
         ' <img class="locationIcon" src="location.png" />' +
        '</div>' +
        `<div class="collapse collapseBody" id="collapseElem${index}">` +
          '<div class="hzLine"></div>' +
          '<div class="tableContainer">' +
            '<table class="attrTable">' +
              '<tbody>' +
                '<tr valign="top">' +
                  `<td class="attrName"> Dirección </td>` +
                  `<td class="attrValue"> ${direction.attribute} Fitch</td>` +
                '</tr>' +
                '<tr valign="top">' +
                  '<td class="attrName"> Coord. X </td>' +
                  `<td class="attrValue"> ${direction.location.x.toString().slice(0,10)} </td>` +
                '</tr>' +
                '<tr valign="top">' +
                  '<td class="attrName"> Coord. Y </td>' +
                  `<td class="attrValue">${direction.location.y.toString().slice(0,10)}</td>` +
                '</tr>'+
              '</tbody>'+
            '</table>'+
          '</div>'+
        '</div>'+
      '</li>'
    t1.appendChild(d);
    addPoint();
}

function addPoint() {
  require([
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "dojo/domReady!"
  ], function(GraphicsLayer, Graphic) {
    var point = {
      type: "point",
      x: response.location.x,
      y: response.location.y
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
  });
}

function loadRoute(id) {
  routeSelectedId = id;
  routeGraphicsLayer.removeAll();
  require([
    "esri/tasks/support/Query"
  ], function(Query) {
    var queryRoute = new Query();
    queryRoute.where = `OBJECTID=${routeSelectedId}`;
    queryRoute.returnGeometry = true;
    trailFeatureLayer.queryFeatures(queryRoute).then(function(results){
      responseRoute = results.features[0].geometry.paths;
      addRoute();
      loadEvents();
    });
  })
}

function loadEvents() {
  require([
    "esri/tasks/support/Query"
  ], function(Query) {
    var queryRoute = new Query();
    queryRoute.where = `eventId=${routeSelectedId}`;
    queryRoute.returnGeometry = true;
    eventFeatureLayer.queryFeatures(queryRoute).then(function(results){
      directions = [];
      for (var i = 0; i < results.features.length; i++) {
        var direction = {};
        var coordinates = {};
        coordinates.x = results.features[i].geometry.x;
        coordinates.y = results.features[i].geometry.y;
        direction.location = coordinates;
        direction.attribute = results.features[i].attributes.description;
        directions.push(direction);

      }
      addEventsHTML();
    });
  })
}

function addEventsHTML() {
  var elem = document.getElementById("sortable");
  while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
  }
  for (var i = 0; i < directions.length; i++) {
    response = directions[i];
    appendHTML(directions[i], i);
  }

}

