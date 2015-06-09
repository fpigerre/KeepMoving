var eventParameter;

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
    patchEventData();
}

function loadEventData() {
    eventParameter = getEventParameter();
    if (!eventParameter) window.location.href = "404.html";

    var calendarRequest = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': eventParameter
    });

    calendarRequest.execute(function (response) {
        if (response.code == 404) window.location.href = "404.html";
        $('#title').val(response.summary);
        $('#description').val(response.description);
    });
}

function patchEventData() {
    $('#save').click(function () {
        var request = gapi.client.calendar.events.patch({
            'calendarId': 'primary',
            'eventId': eventParameter,
            'resource': {
                summary: $('#title'),
                description: $('#description')
            }
        });

        request.execute(function (response) {
            // ERROR: Uncaught SecurityError: Protocols must match (TLS)
        });
    });
}