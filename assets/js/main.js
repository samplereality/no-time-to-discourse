"use strict";

// Load version information
async function loadVersionInfo() {
    try {
        const response = await fetch('/package.json');
        const packageData = await response.json();
        
        // Set version number
        document.getElementById('version-number').textContent = packageData.version;
        
        // Get last modified date from the page itself
        const lastModified = document.lastModified;
        const formattedDate = new Date(lastModified).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('last-updated').textContent = formattedDate;
    } catch (error) {
        console.log('Could not load version info:', error);
        document.getElementById('version-number').textContent = '1.0.0';
        document.getElementById('last-updated').textContent = 'Unknown';
    }
}

// Load version info when page loads
document.addEventListener('DOMContentLoaded', loadVersionInfo);

let geoJsonLayer; // store globally or in a higher scope
let currentFeature; // Store the current feature being processed
let currentMonth; // Store the month from makeDate() for grammar access
let distantFutureMonth; // Store the month from makeDistantFutureDate() for grammar access
let currentYear; // Store the year from date generation for grammar access
let cachedStartYear; // Cache the start year so it's consistent within same tooltip
let isDistantFutureContext = false; // Flag to track if we're in distant future context
let season;


// Load RiTa
let context = {
    silent: () => '',
    pluralNoun: () => RiTa.randomWord({ pos: "nns" }),
    adjective: () => RiTa.randomWord({pos: 'jj'}),
    noun: () => RiTa.randomWord({ pos: "nn" }),
    date: () => makeDateSmart(),
    time: () => makeTime(),
    timeOfDay: () => makeTimeOfDay(),
    device: () => getDeviceType(),
    cityName: () => currentFeature ? currentFeature.properties.name : 'Unknown City',
    month: () => isDistantFutureContext ? distantFutureMonth : currentMonth,
    year: () => currentYear,
    startYear: () => {
        if (!currentYear) return 'unknown';
        // Only calculate once per tooltip, then cache it
        if (cachedStartYear === null) {
            const yearsBefore = Math.floor(Math.random() * 21) + 10; // Random between 10-30
            cachedStartYear = parseInt(currentYear) - yearsBefore;
        }
        return cachedStartYear;
    },
    season: () => {
        const monthToCheck = isDistantFutureContext ? distantFutureMonth : currentMonth;
        if (!monthToCheck) return 'unknown';
        
        const winterMonths = ['November', 'December', 'January', 'February'];
        const springMonths = ['March', 'April', 'May'];
        const summerMonths = ['June', 'July', 'August'];
        const fallMonths = ['September','October'];
        
        if (winterMonths.includes(monthToCheck)) return 'winter';
        if (springMonths.includes(monthToCheck)) return 'spring';
        if (summerMonths.includes(monthToCheck)) return 'summer';
        if (fallMonths.includes(monthToCheck)) return 'fall';
        
        return 'unknown';
    },
    waterLevel: () => {
        return Math.floor(Math.random() * 41) + 10; // Random number between 10 and 50
    },
        iceCondition: () => {
        const currentSeason = context.season();
        
        if (currentSeason === 'winter') return '(surprisingly slushy | not solid at all)';
        if (currentSeason === 'spring') return '(mostly melted | softening | patchy)';
        if (currentSeason === 'summer') return '(thawed | gone)';
        if (currentSeason === 'fall') return '(mushy | barely refreezing)';
        
        return 'unknown';
    },
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

    const futureDate = dayjs().add(randomDaysToAdd, 'day');
    currentMonth = futureDate.format('MMMM'); // Store the month name for grammar access
    currentYear = futureDate.format('YYYY'); // Store the year for grammar access
    
    return futureDate.format('dddd, MMMM D, YYYY');
}

// A function for distant future dates
function makeDistantFutureDate() {
    const minYears = 15;
    const maxYears = 100;
    // Generate a random number between minYears and maxYears
    const randomYearsToAdd = Math.floor(Math.random() * (maxYears - minYears + 1)) + minYears;

    const distantFutureDate = dayjs().add(randomYearsToAdd, 'year');
    distantFutureMonth = distantFutureDate.format('MMMM'); // Store the month name for grammar access
    currentYear = distantFutureDate.format('YYYY'); // Store the year for grammar access
    isDistantFutureContext = true; // Set the flag
    
    return distantFutureDate.format('dddd, MMMM D, YYYY');
}

// A single date function that chooses based on current feature
function makeDateSmart() {
    // Check if this is a far north location (note === 6)
    if (currentFeature && currentFeature.properties.note === 6) {
        return makeDistantFutureDate();
    } else {
        return makeDate();
    }
}

// Grab the current time
function makeTime() {
    return dayjs().format('dddd, h:mm a');
}

// Determine time of day period
function makeTimeOfDay() {
    const hour = dayjs().hour();
    
    if (hour >= 5 && hour < 12) {
        return 'morning';
    } else if (hour >= 12 && hour < 17) {
        return 'afternoon';
    } else if (hour >= 17 && hour < 21) {
        return 'evening';
    } else {
        return 'night';
    }
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
        return "tablet"; // or "tablet" if you want a separate category for tablets
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
var southWest = L.latLng(20, -175), // Adjusted to southern tip of South America and further west to include ocean
    northEast = L.latLng(63, -56); // Adjusted to include far north of North America and east towards the mid-Atlantic
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

// Hide Leaflet Attribution
map.attributionControl.setPrefix(false);

// add tiles, attribution, etc.
L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
	attribution: 'No Time to Discourse | Stories by <a href="https://samplereality.itch.io/">Mark Sample</a> | Map by <a href="https://stamen.com/work/maps-stamen-com/">Stamen Design</a>',
	subdomains: 'abcd',
	minZoom: 4,
	maxZoom: 16,
	ext: 'jpg',
    edgeBufferTiles: 2
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
    // Reset date variables for each tooltip generation
    currentMonth = null;
    distantFutureMonth = null;
    currentYear = null;
    cachedStartYear = null;
    isDistantFutureContext = false;
    
    // Set the current feature for the context to access
    currentFeature = layer.feature;

    let city = layer.feature.properties.name;
    let state = layer.feature.properties.adm1name;
    
    if (layer.feature.properties.note === 1) {
        rule = "westCoast";
        } else if (layer.feature.properties.note === 2) {
        rule = "orlando";
        console.log("I'm going to Disney World!");
        } else if (layer.feature.properties.note === 3) {
        rule = "florida";
        }
        else if (layer.feature.properties.note === 4) {
        rule = "eastCoast";
        }
        else if (layer.feature.properties.note === 5) {
        rule = "gulfCoast";
        }
        else if (layer.feature.properties.note === 6) {
        rule = "farNorth";
        }
        else if (layer.feature.properties.note === 7) {
        rule = "hawaii";
        }
        else {
        rule = "start";
        }
    
    return "<strong>" + city + ", " + state + "</strong><br>" + rg.expand(rule); 
}, {opacity: 1.0, className: 'disasterLabels'}).addTo(map);

});