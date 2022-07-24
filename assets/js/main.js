"use strict";

// Load RiTa
let rg = RiTa.grammar(rules); 

// create base map
// var map = L.map('map').fitWorld();

var map = L.map('map', {
    center: [35.227, -80.8431],
    zoom: 6
});

// Set bounds for the map
var southWest = L.latLng(-89.98155760646617, -180),
northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

// add tiles, attribution, etc.
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
}).addTo(map);

// Grab coordinates from geojson, add stories to markers, and add to map
$.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson', function(data) {
  L.geoJson(data, {
    style: function (feature) {
        return {color: feature.properties.color};
    }
}).bindTooltip(function (layer) {
    return layer.feature.properties.name + ", " + layer.feature.properties.adm1name + "<br><br>" + rg.expand(); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

});