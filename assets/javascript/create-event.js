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
    gapi.client.load('calendar', 'v3');

    $('button').click(function () {
        var date = new Date(Date.now());
        createEvent("Testing", "Test Location", date, new Date(date + 1));
    });
}

/**
 * Creates an event and adds it to the user's primary google calendar
 *
 * @param summary A summary of the event
 * @param location The location at which the event is to be held
 * @param dateFrom The time at which the event starts, as a Date object
 * @param dateTo The time at which the event ends, as a Date object
 */
function createEvent(summary, location, dateFrom, dateTo) {
    var resource = {
        "summary": summary.toString(),
        "location": location.toString(),
        "start": {
            "dateTime": dateFrom.toISOString()
        },
        "end": {
            "dateTime": dateTo.toISOString()
        }
    };
    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': resource
    });
    request.execute(function (response) {
        if (response.status === "confirmed") window.location.replace('event.html?event=' + response.id);
    });
}