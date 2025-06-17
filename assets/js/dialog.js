var SESSION_KEY = 'dialog-session';
var ONE_DAY_MILLI_SEC = 12 * 60 * 60 * 1000; // change first number to whatever hour; 24 for showing dialog once a day

// Add development mode flag
var DEVELOPMENT_MODE = true; // Set to false for production

function disableMapInteraction() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
	document.getElementById('map-overlay').style.display = 'block';
}

function enableMapInteraction() {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
	document.getElementById('map-overlay').style.display = 'none';
}

function hideCursor() {
    var mapContainer = map.getContainer();
    mapContainer.style.cursor = 'none';
}

function showCursor() {
    var mapContainer = map.getContainer();
    mapContainer.style.cursor = ''; // Reverts to the stylesheet default
}

function performFlyTo() {
    if (map) {
        if (DEVELOPMENT_MODE) {
            // Development mode: jump directly to location
            // map.setView([43, -79], 7); // Toronto coordinates
			// map.setView([30, -97], 7); // Gulf coordinates
            // map.setView([33.9, -118],7); // LA Coordinates
            map.setView([55.2, -100],6); // Artic coordinates

            
            // Show icons immediately
            document.querySelectorAll('.leaflet-marker-icon').forEach((icon) => {
                icon.style.opacity = '1';
            });
            document.querySelectorAll('.leaflet-marker-shadow').forEach((shadow) => {
                shadow.style.opacity = '.8';
            });
        } else {
            // Production mode: original animation
            disableMapInteraction();
            hideCursor();

            map.flyTo([43, -79], 7, {duration: 7});

            setTimeout(() => {
                // Fade in icons
                document.querySelectorAll('.leaflet-marker-icon').forEach((icon) => {
                  icon.style.opacity = '1';
                });
                // Fade in shadows
                document.querySelectorAll('.leaflet-marker-shadow').forEach((shadow) => {
                  shadow.style.opacity = '.8';
                });
              }, 1000);

            // Re-enable interactions once flying is done
            map.once('moveend', function() {
                enableMapInteraction();
                showCursor();
            });
        }
    }
}

function openDialog() {
    if (DEVELOPMENT_MODE) {
        // Skip dialog in development mode
        setTimeout(performFlyTo, 100); // Small delay to ensure map is ready
        return;
    }

	// keep the last session timestamp in local storage to
	//  re-show after 24 hours since last ack
	if (localStorage) {
		var sessionTimestamp = localStorage.getItem(SESSION_KEY);
		if (sessionTimestamp && Date.now() - sessionTimestamp < ONE_DAY_MILLI_SEC) {
			setTimeout(performFlyTo, 1000);
			return;
		}
	}

	var html = '<div class=\'container iframe-container\'><iframe src=\'dialog.html\'></iframe><button type="submit" class=\'close-dialog\' aria-label=\'close\'>&times;</button></div>';

	var dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.setAttribute('role', 'dialog');
	dialog.innerHTML = html;

	document.body.insertBefore(dialog, document.body.firstChild);
	document.body.classList.add('overflowHidden');

	setTimeout(function () {
		dialog.focus();
	}, 100);

	var closeBtn = document.querySelector('.close-dialog');
	closeBtn.addEventListener('click', function () {
		var dialog = document.getElementById('dialog');
		document.body.removeChild(dialog);
		document.body.classList.remove('overflowHidden');
		performFlyTo();
		if (localStorage) {
			localStorage.setItem(SESSION_KEY, Date.now());
		}
	});

	// keep focus in dialog
	// https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/
	dialog.addEventListener('transitionend', function () {
		dialog.querySelector('iframe').focus();
	});
}

openDialog();