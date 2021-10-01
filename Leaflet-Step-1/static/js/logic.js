// Create the base layers.
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {  
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",  
    tileSize: 512, 
    maxZoom: 18,  
    zoomOffset: -1,  
    id: "mapbox/light-v10",  
    accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {  
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",  
    tileSize: 512,  
    maxZoom: 18,  
    zoomOffset: -1,  
    id: "mapbox/satellite-v9",  
    accessToken: API_KEY
});

// Create our map, giving it the streetmap and earthquakes layers to display on load.
var myMap = L.map("map", {
    center: [
      40.7, -94.5
    ],
    zoom: 3,
    layers: [graymap, satellitemap]
});

graymap.addTo(myMap);

var baseMaps = {
    Grayscale: graymap,
    Satellite: satellitemap
  
};

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
  };

  // Then we add a control to the map that will allow the user to change which
  // layers are visible.
L
    .control
    .layers(baseMaps, overlays)
    .addTo(myMap);

// Our AJAX call retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into two separate functions
    // to calculate the color and radius.
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }

    // This function determines the color of the marker based on the magnitude of the earthquake.
    function getColor(depth) {
      switch (true) {
        case depth > 90:
          return "#EA2C2C";
        case depth > 70:
          return "#EA822C";
        case depth > 50:
          return "#EE9C00";
        case depth > 30:
          return "#EECC00";
        case depth > 10:
          return "#D4EE00";
        default:
          return "#98EE00";
      }
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 4;
    }

    // Here we add a GeoJSON layer to the map once the file is loaded.
    L.geoJson(data, {
      // We turn each feature into a circleMarker on the map.
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      // We set the style for each circleMarker using our styleInfo function.
      style: styleInfo,
      // We create a popup for each marker to display the magnitude and location of
      // the earthquake after the marker has been created and styled
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
        );
      }
      // We add the data to the earthquake layer instead of directly to the map.
    }).addTo(earthquakes);
    // Then we add the earthquake layer to our map.
    earthquakes.addTo(myMap);

    // Here we create a legend control object.
    var legend = L.control({
      position: "bottomright"
    });

    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");
      var grades = [-10, 10, 30, 50, 70, 90];
      var colors = [
        "#98EE00",
        "#D4EE00",
        "#EECC00",
        "#EE9C00",
        "#EA822C",
        "#EA2C2C"];
      // Loop through our intervals and generate a label with a colored square for each interval.
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += "<i style='background: "
          + colors[i]
          + "'></i> "
          + grades[i]
          + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };

    // We add our legend to the map.
    legend.addTo(myMap);

    // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
      function (platedata) {
        // Adding our geoJSON data, along with style information, to the tectonicplates
        // layer.
        L.geoJson(platedata, {
          color: "orange",
          weight: 2
        })
          .addTo(tectonicplates);
        // Then add the tectonicplates layer to the map.
        tectonicplates.addTo(myMap);
      });
  });