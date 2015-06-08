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
 * Load Google Calendar client library.
 */
function loadElements() {
    gapi.client.load('calendar', 'v3', loadEventData);
}

function loadEventData() {
    var parameter = getEventParameter();
    // TODO: Create 404 page
    if (!parameter) window.location.href = "404.html";

    var calendarRequest = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': parameter
    });

    calendarRequest.execute(function (response) {
        if (response.code == 404) {
            window.location.href = "404.html";
        } else {

        }
    });
}