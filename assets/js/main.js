"use strict";

let geoJsonLayer; // store globally or in a higher scope
let currentFeature; // Store the current feature being processed


// Load RiTa
let context = {
    silent: () => '',
    pluralNoun: () => RiTa.randomWord({ pos: "nns" }),
    noun: () => RiTa.randomWord({ pos: "nn" }),
    date: () => makeDate(),
    time: () => makeTime(),
    device: () => getDeviceType(),
    cityName: () => currentFeature ? currentFeature.properties.name : 'Unknown City',
    POI: () => {
        if (!currentFeature) return '';
        
        const poiField = currentFeature.properties.POI;
        
        // Return empty string if POI is null or undefined
        if (!poiField) return '';
        
        // Check if the POI contains RiTa grammar syntax (contains | or other grammar symbols)
        if (poiField.includes('|')) {
            // Create a temporary grammar with just this rule
            const tempRules = {
                poiRule: poiField
            };
            const tempGrammar = RiTa.grammar(tempRules, context);
            return tempGrammar.expand('poiRule');
        } else {
            // Return the POI as-is if it's not a grammar rule
            return poiField;
        }
    }
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



// Create the map instance (without zoom control initially)
var map = L.map('map', {
    center: [35, -80],
    zoom: 4,
    maxBoundsViscosity: .5,
    zoomControl: false // Disable default zoom control so we can add it after hamburger
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
	attribution: 'Map by <a href="https://stamen.com/work/maps-stamen-com/">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> | Stories by <a href="https://samplereality.itch.io/">Mark Sample</a>',
	subdomains: 'abcd',
	minZoom: 4,
	maxZoom: 16,
	ext: 'jpg'
}).addTo(map);

// Create custom hamburger control
L.Control.Hamburger = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-control-hamburger');
        
        // Create hamburger icon
        var icon = L.DomUtil.create('span', 'hamburger-icon', container);
        
        // Prevent map events when clicking on the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        // Add click event
        L.DomEvent.on(container, 'click', function(e) {
            L.DomEvent.stopPropagation(e);
            $('#aboutModal').modal('show');
        });

        return container;
    }
});

// Add the hamburger control to the map first
map.addControl(new L.Control.Hamburger());

// Then add the zoom control so it appears below the hamburger
L.control.zoom({ position: 'topleft' }).addTo(map);


// Grab coordinates from geojson, add stories to markers, and add to map
$.getJSON('assets/js/disasters.json', function(data) {
    geoJsonLayer = L.geoJson(data, {
        style: function (feature) {
            return {
                color: feature.properties.color
            };
        }
    }).bindTooltip(function (layer) {
    // Set the current feature for the context to access
    currentFeature = layer.feature;

    let city = layer.feature.properties.name;
    let state = layer.feature.properties.adm1name;
    
    if (layer.feature.properties.note === 2) {
        rule = "orlando";
        console.log("I'm going to Disney World!");
        } else if (layer.feature.properties.note === 3) {
        rule = "florida";
        } else if (layer.feature.properties.note === 4) {
        rule = "eastCoast";
        }
        else if (layer.feature.properties.note === 5) {
        rule = "gulfCoast";
        }
        else {
        rule = "start";
        }
    
    return "<strong>" + city + ", " + state + "</strong><br>" + rg.expand(rule); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

});