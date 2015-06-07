var CLIENT_ID;
var SCOPES;

/**
 * Gets Google API Client ID and Scope data from a JSON file.
 */
$.getJSON('information.json', function (data) {
    CLIENT_ID = data.CLIENT_ID;
    SCOPES = data.SCOPES;
});

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
        }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        loadElements();
    } else {
        window.location.replace('authentication.html');
    }
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded. Load and initialize other
 * elements for display
 */
function loadElements() {
    gapi.client.load('calendar', 'v3', loadEventData);
    //gapi.client.load('plus', 'v1', initializeProfileData);
    launchClock();
}

function loadEventData() {
    var parameter = getEventParameter();
    // TODO: Create 404 page
    if (!parameter) window.location.replace("404.html");

    var calendarRequest = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': parameter
    });

    calendarRequest.execute(function (response) {
        if (response.code == 404) {
            window.location.replace("404.html")
        } else {
            // \xB7 is the HexCode for a &middot
            document.title = 'KM \xB7 ' + response.summary;

            // TODO: Add support for all day events
            document.getElementById('title').innerHTML = response.summary;
            document.getElementById('time-from').innerHTML = new Date(response.start.dateTime).toLocaleString();
            document.getElementById('time-to').innerHTML = new Date(response.end.dateTime).toLocaleDateString();
            document.getElementById('description').innerHTML = response.description;
        }
    });
}