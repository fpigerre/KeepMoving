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
    gapi.client.load('calendar', 'v3', loadEventData);
    gapi.client.load('calendar', 'v3', loadSidebarEvents);
}

function loadEventData() {
    var parameter = getEventParameter();
    if (!parameter) window.location.href = "404.html";

    var calendarRequest = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': parameter
    });

    calendarRequest.execute(function (response) {
        if (response.code == 404) {
            window.location.href = "404.html";
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

    $(document).on('click', '.ion-edit', function (callback) {
        window.location.href = 'edit.html?event=' + getEventParameter();
    });
}

function loadSidebarEvents() {
    // Set parameters for data collection
    var timeSpan = 'month';
    var today = new Date(Date.now());
    var minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var maxDate;
    switch (timeSpan) {
        case 'day':
            maxDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + 1);
            break;

        case 'month':
            maxDate = new Date(minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate() + 1);
            break;
    }

    var calendarRequest = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': minDate.toISOString(),
        'timeMax': maxDate.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    calendarRequest.execute(function (response) {
        var events = response.items;

        if (events.length > 0) {
            var containers = document.getElementsByClassName('upcoming');

            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var array = createMetroNode(event);
                if (i < 4) containers[i].innerHTML = array[1];
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