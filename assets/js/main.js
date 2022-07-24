"use strict";

// create base map
// var map = L.map('map').fitWorld();

let rg = RiTa.grammar(rules); 


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

$.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson', function(data) {
  L.geoJson(data, {
    style: function (feature) {
        return {color: feature.properties.color};
    }
}).bindTooltip(function (layer) {
    return layer.feature.properties.name + ", " + layer.feature.properties.ADM1NAME + "<br><br>" + rg.expand(); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

});



/**
 * Create an array of dreams
 */

// function createDreams(n = 5) {
//     // array to hold them
//     let arr = [];
//     // rg.load(grammar);
//     // loop n times
//     for (let i = 0; i < n; i++) {
//         var results = rg.expand()
//         arr.push(results);
//     }
//     return arr;
// }

/**
 * Create an array of fake users
 */
// function createFakes(n = 5) {
//     // array to hold them
//     let arr = [];
//     // loop n times
//     for (let i = 0; i < n; i++) {
//         arr.push(faker.helpers.userCard());
//     }
//     return arr;
// }

// array to hold markers and fakes
// let markers = [],
//     fakes = createFakes(200)
//     var dreams = createDreams(200)
//  console.log(fakes);
//  console.log(dreams);

// add markers to map 
// addMarkers(fakes);

/**
 * Add fake markers to map from fakes array 
 */
// function addMarkers(fakes) {
//     // for each fake 
//     for (let i = 0; i < fakes.length; i++) {
//         // create a marker with lat/lng
//         let marker = L.marker([fakes[i].address.geo.lat, fakes[i].address.geo.lng]);
//         // bind data into popup
//         marker.bindPopup(dreams[i]);
//         marker.on('mouseover', function(e) {
//             this.openPopup();
//         });
//         marker.on('mouseout', function(e) {
//             this.closePopup();
//         });
//         // add to marker array 
//         markers.push(marker);
//     }
//     // create group from markers and add to map
//     var group = L.featureGroup(markers).addTo(map);
    // zoom to group
    // map.fitBounds(group.getBounds());
// }