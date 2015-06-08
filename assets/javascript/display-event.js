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
            // \xB7 is the HexCode for &middot
            document.title = 'KM \xB7 ' + response.summary;

            document.getElementById('title').innerHTML = response.summary;
            document.getElementById('description').innerHTML = response.description;

            if (response.start.dateTime && response.end.dateTime) {
                updateTimes(new Date(response.start.dateTime), new Date(response.end.dateTime));
            } else {
                // If the event is an all day event, use null times
                updateTimes(null, null);
            }
        }
    });
}

/**
 * Update the times during which the event are occurring
 *
 * @param timeFrom The time at which the event starts, as a Date object
 * @param timeTo The time at which the event ends, as a Date object
 */
function updateTimes(timeFrom, timeTo) {
    if (timeFrom && timeTo) {
        var fromMinutes = timeFrom.getMinutes();
        var toMinutes = timeTo.getMinutes();

        if (fromMinutes.length < 2 || !fromMinutes) fromMinutes = fromMinutes + '0';
        if (toMinutes.length < 2 || !toMinutes) toMinutes = toMinutes + '0';

        if (timeFrom.getHours() >= 0 && timeFrom.getHours() < 12) {
            document.querySelector('#time-from .time').innerHTML = timeFrom.getHours() + ':' + fromMinutes;
            document.querySelector('#time-from div p').innerHTML = 'A<br>M';
        } else {
            document.querySelector('#time-from .time').innerHTML = (timeFrom.getHours() - 12) + ':' + fromMinutes;
            document.querySelector('#time-from div p').innerHTML = 'P<br>M';
        }

        if (timeTo.getHours() >= 0 && timeTo.getHours() < 12) {
            document.querySelector('#time-to .time').innerHTML = timeTo.getHours() + ':' + toMinutes;
            document.querySelector('#time-to div p').innerHTML = 'A<br>M';
        } else {
            document.querySelector('#time-to .time').innerHTML = (timeTo.getHours() - 12) + ':' + toMinutes;
            document.querySelector('#time-to div p').innerHTML = 'P<br>M';
        }
    } else {
        document.getElementById('time-from').remove();
        document.getElementById('time-to').remove();
        $('.separator').remove();
        $('<div class=\"all-day\"><p>ALL DAY</p></div>').insertBefore('#description');
    }
}