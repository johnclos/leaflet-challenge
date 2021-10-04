console.log("hello")
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

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

var myMap = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3,
    layers: [graymap, satellitemap, outdoors]
});

graymap.addTo(myMap);

var baseMaps = {
    Satellite: satellitemap,
    Grayscale: graymap,
    Outdoors: outdoors
};

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var overlays = {
    Tectonic: tectonicplates,
    Earthquakes: earthquakes
};

L
    .control
    .layers(baseMaps, overlays)
    .addTo(myMap);

// earthquake url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Loop through the earthquakes json data
d3.json(url, function (myData) {
    console.log("myData")
    console.log(myData)

    var features = myData.features
    console.log("features")
    console.log(features)

    console.log("features.length")
    console.log(features.length)

    for (var i = 0; i < features.length; i++) {
        var location = [features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]];
        var depth = features[i].geometry.coordinates[2];
        var magnitude = features[i].properties.mag;

        // earthquake color by depth
        var color = "";
        if (depth > 90) {
            color = "#ea2c2c";
        }
        else if (depth > 70) {
            color = "#ea822c";
        }
        else if (depth > 50) {
            color = "#e6ca17";
        }
        else if (depth > 30) {
            color = "#78e617";
        }
        else if (depth > 10) {
            color = "#17e6df";
        }
        else {
            color = "#d4ee00";
        }

        // Add circles to the map.
        L.circle(location, {
            fillOpacity: 1,
            color: "#000000",
            fillColor: color,
            radius: magnitude * 60000,
            stroke: true,
            weight: 0.5
        }).bindPopup("<h1>" + features[i].properties.place + "</h1> <hr> <h3>Points: " + features[i].properties.mag + "</h3>").addTo(earthquakes);
    }

    earthquakes.addTo(myMap);

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


    // legend at bottom right corner
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#d4ee00",
            "#17e6df",
            "#78e617",
            "#e6ca17",
            "#ea822c",
            "#ea2c2c"
        ];

        // generate a legend with a colored square for each interval.
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
                + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // legend to the map.
    legend.addTo(myMap);

});

