var SESSION_KEY = 'dialog-session';
var ONE_DAY_MILLI_SEC = 0 * 60 * 60 * 1000; // change first number to whatever hour; 24 for showing dialog once a day

// Add development mode flag
var DEVELOPMENT_MODE = false; // Set to false for production

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
            // map.setView([55.2, -100],6); // Arctic coordinates
            map.setView([21.2, -159],4); // Hawaii coordinates

            
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

	var modalHtml = `
		<div class="modal fade" id="openingModal" tabindex="-1" role="dialog" aria-labelledby="openingModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
                        <h5 class="modal-title">No Time to Discourse</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="prologue">
							<p><em>No Time To Discourse</em> is a speculative atlas of climate disaster throughout North America. There are thousands of disasters, none of which have happened, all of which are happening, today, tomorrow, and tomorrow's tomorrow.</p>
							<p>Mark Sample<br>North Carolina<br>2025</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	document.body.insertAdjacentHTML('beforeend', modalHtml);
	
	$('#openingModal').modal('show');
	
	$('#openingModal').on('hidden.bs.modal', function () {
		$(this).remove();
		performFlyTo();
		if (localStorage) {
			localStorage.setItem(SESSION_KEY, Date.now());
		}
	});
}

openDialog();