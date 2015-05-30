// https://developers.google.com/google-apps/calendar/auth if you want to
// request write scope.

var CLIENT_ID;
var SCOPES;

$.getJSON("information.json", function (data) {
    CLIENT_ID = data.CLIENT_ID;
    SCOPES = data.SCOPE;
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
        loadCalendarApi();
    } else {
        window.location.replace("authentication.html");
    }
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', loadCalendarData);
}

// TODO: Integrate other windows
function loadCalendarData() {
    var window = "month";
    var today = new Date(Date.now());
    var minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var maxDate;
    switch (window) {
        case "day":
            maxDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + 1);
            break;

        case "month":
            maxDate = new Date(minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate() + 1);
            break;
    }

    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': minDate.toISOString(),
        'timeMax': maxDate.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    request.execute(function (resp) {
        var events = resp.items;

        if (events.length > 0) {
            var container = document.getElementsByClassName('upcoming');

            for (var i = 0; i < container.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;

                if (!when) {
                    // Use the event's date
                    var eventDate = event.start.date.substring(6).split('-');
                    when = appendSuffix(eventDate[1]) + " of " + getMonthString(eventDate[0]);
                } else if (event.start.dateTime.substring(8, 10) != today.getDate()) {
                    // Use the event's date
                    var date = event.start.dateTime.substring(5, 10).split('-');
                    when = appendSuffix(date[1]) + " of " + getMonthString(date[0]);
                } else {
                    // Use the event's time
                    when = event.start.dateTime.substring(12, 16);
                }
                container[i].innerHTML = '<h3>' + when + '</h3><p>' + event.summary + '</p>';
            }
        } else {
            // TODO: Handle lack of events
        }
    });
}

function appendSuffix(i) {
    i = parseInt(i, 10);

    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function getMonthString(i) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    i = parseInt(i, 10);
    return monthNames[i];
}