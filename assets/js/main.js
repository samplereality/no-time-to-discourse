"use strict";

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
    // center: [35.227, -80.8431],
    center: [1.227, -30.8431],
    zoom: 3
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
L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 3,
	maxZoom: 16,
	ext: 'jpg'
}).addTo(map);

// TODO: Grab an even bigger dataset of JSON values from https://geojson.xyz/
// Grab coordinates from geojson, add stories to markers, and add to map
$.getJSON('assets/js/disaster.json', function(data) {
  L.geoJson(data, {
    style: function (feature) {
        return {color: feature.properties.color};
    }
}).bindTooltip(function (layer) {
    if (layer.feature.properties.ADM1NAME === null) {
        var state = layer.feature.properties.SOV0NAME;
    } else {
        if (layer.feature.properties.ADM0NAME === "United States of America") {
            var state = layer.feature.properties.ADM1NAME;
        } else {
            var state = layer.feature.properties.ADM0NAME;
        }
    }
    if (layer.feature.properties.TIMEZONE === "America/New_York") {
        var rule = "start";
    } else {
        var rule = "start";
    }
    return "<strong>" + layer.feature.properties.NAME + ", " + state + "</strong><br>" + rg.expand(rule); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

        // Animate zoom to the user's time zone location
        setTimeout(() => {
            map.flyTo([43.1704256379, -77.6199497901], 5); // Adjust zoom level as needed
        }, 1000); // Adjust delay as needed

});