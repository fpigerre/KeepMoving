var CLIENT_ID;
var SCOPES;

/**
 * Gets Google API Client ID and Scope data from a JSON file.
 */
$.getJSON("information.json", function (data) {
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
        window.location.replace("authentication.html");
    }
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded. Load and initialize other
 * elements for display
 */
function loadElements() {
    gapi.client.load('calendar', 'v3', loadCalendarData);
    gapi.client.load('plus', 'v1', initializeProfileData);
    launchClock();
}

/**
 * Get Calendar data from the Google API, sanitize
 * and display it.
 */
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

    var calRequest = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': minDate.toISOString(),
        'timeMax': maxDate.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    calRequest.execute(function (response) {
        var events = response.items;

        if (events.length > 0) {
            var container = document.getElementsByClassName('upcoming');
            var node = '';

            for (var i = 0; i < container.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                node = node + '<div class=\"metro-box\">';
                console.log(node);

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

                if (event.description && event.description.includes(":icon:")) {
                    var icon = '<i class=\"' +  event.description.split(":icon:").pop() + '\"></i>'
                }

                // Append event data to a container object
                if (icon) {
                    container[i].innerHTML = '<h3>' + when + '</h3>' + icon + '<p>' + event.summary + '</p>';
                    node = node + icon;
                    icon = null;
                } else {
                    container[i].innerHTML = '<h3>' + when + '</h3><p>' + event.summary + '</p>';
                }

                node = node + '</div>';
            }
            document.getElementById("metro").innerHTML = node;
        } else {
            // TODO: Handle lack of events
        }
    });
}

/**
 * Hook into the Google+ API and update the displayed name
 */
function initializeProfileData() {
    var profileRequest = gapi.client.plus.people.get({'userId': 'me'});
    profileRequest.execute(function (response) {
        updateName(response.displayName);
    });
}