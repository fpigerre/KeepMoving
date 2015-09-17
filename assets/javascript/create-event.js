/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    forceTLS();
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
    gapi.client.load('calendar', 'v3', loadSidebarEvents);

    var dateFrom = $('#date-from').pickadate();
    var dateTo = $('#date-to').pickadate();
    var timeFrom = $('#time-from').pickatime();
    var timeTo = $('#time-to').pickatime();

    $('#all-day').change(function () {
        if (this.checked) {
            $('#times').hide();
        } else {
            $('#times').show();
        }
    });

    $('.submit').click(function () {
        var from = new Date(dateFrom.year, dateFrom.month, dateFrom.date, timeFrom.hour, timeFrom.mins);
        var to = new Date(dateTo.year, dateTo.month, dateTo.date, timeTo.hour, timeTo.mins);
        createEvent($('#title').val(), $('#location textarea').val(), from.toISOString(), to.toISOString());

        // TODO: Add flash message to indicate confirmation
        window.location.href = 'index.html';
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