"use strict";

let geoJsonLayer; // store globally or in a higher scope

// Load RiTa
let context = {
    silent: () => '',
    pluralNoun: () => RiTa.randomWord({ pos: "nns" }),
    noun: () => RiTa.randomWord({ pos: "nn" }),
    date: () => makeDate(),
    time: () => makeTime(),
    device: () => getDeviceType()
};

let rg = RiTa.grammar(rules, context); 
let rule;

// A function for future dates

function makeDate() {
    const minDays = 3;
    const maxDays = 1460;
    // Generate a random number between minDays and maxDays
    const randomDaysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;

    return dayjs().add(randomDaysToAdd, 'day').format('dddd, MMMM D, YYYY');
}

// Grab the current time
function makeTime() {
    return dayjs().format('dddd, h:mm a');
}

// Determine phone or not
function getDeviceType() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iPhone
    if (/iPhone/.test(userAgent)) {
        return "phone";
    }

    // Check for iPad
    if (/iPad/.test(userAgent)) {
        return "phone"; // or "tablet" if you want a separate category for tablets
    }

    // Check for Android mobile (not tablets)
    if (/android/i.test(userAgent) && /mobile/i.test(userAgent)) {
        return "phone";
    }

    // Check for other common mobile identifiers
    if (/blackberry|mini|windows\sce|palm/i.test(userAgent)) {
        return "phone";
    }

    // Default to computer
    return "computer";
}

var device = getDeviceType();
console.log("You are using a " + device + ".");



// Create the map instance
var map = L.map('map', {
    center: [35, -80],
    zoom: 4,
    maxBoundsViscosity: .5,
});

// Set bounds for the map
// Approximate bounds for North America
var southWest = L.latLng(24, -140), // Adjusted to southern tip of South America and further west to include ocean
    northEast = L.latLng(63, -56); // Adjusted to include far north of North America and east towards the mid-Atlantic
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

// add tiles, attribution, etc.
L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 4,
	maxZoom: 16,
	ext: 'jpg'
}).addTo(map);


// Grab coordinates from geojson, add stories to markers, and add to map
$.getJSON('assets/js/disasters.json', function(data) {
    geoJsonLayer = L.geoJson(data, {
    style: function (feature) {
        return {
            color: feature.properties.color,        };
    }
}).bindTooltip(function (layer) {
    let state = layer.feature.properties.sov0name; // Default to sovereign state name
    if (layer.feature.properties.adm1name && layer.feature.properties.adm0name === "United States of America") {
        state = layer.feature.properties.adm1name; // Use admin-1 name for USA
    } else if (layer.feature.properties.adm1name) {
        state = layer.feature.properties.adm0name; // Use admin-0 name otherwise
    }
    
    if (layer.feature.properties.note === 2) {
        rule = "orlando";
        console.log("I'm going to Disney World!");
        } else if (layer.feature.properties.note === 3) {
        rule = "florida";
        } else if (layer.feature.properties.note === 4) {
        rule = "eastCoast";
        }
        else {
        rule = "start";
        }
    
    return "<strong>" + layer.feature.properties.name + ", " + state + "</strong><br>" + rg.expand(rule); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

});
