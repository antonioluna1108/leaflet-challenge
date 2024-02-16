// Import link
var link  =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// add API key
var api_key = "pk.eyJ1IjoiYW50b25pb2x1bmExMTA4IiwiYSI6ImNscnpmdzIzcjI0ZWkyaW1obWt1ZXZoMXIifQ.hcTV30x7ZoOZB2enGSLtDQ";

// Perform a GET request to the link
d3.json(link).then(function (data) {
 
  // Console log data
  console.log(data);
  // Create features
  createFeatures(data.features);
});

// Marker size
function markerSize(magnitude) {
  return magnitude * 2000;
};

// Color by depth
function chooseColor(depth){
  if (depth < 10) return "#00FF00";
  else if (depth < 30) return "green";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "red";
  else return "#FF0000";
};

function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  };

  // Create a GeoJSON layer that contains the features array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function(feature, latlng) {

      // Determine the style of markers based on properties
      var markers = {
        radius: markerSize(feature.properties.mag) * 25,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 2,
        color: "black",
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlng,markers);
    }
  });

  // Create earthquake map
  createMap(earthquakes);
};

function createMap(earthquakes) {
// I used mapbox.com for my map
  // Create tile layer
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  // Create earthquake layers map on grayscale.
  var myMap = L.map("map", {
    center: [
      40, -90
    ],
    zoom: 3,
    layers: [grayscale, earthquakes]
  });

  // Add legend
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap)
};
