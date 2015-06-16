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
// TODO: Integrate other time spans
function loadCalendarData() {
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
            var metroNodes = [];

            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var array = createMetroNode(event);
                metroNodes[i] = array[0];
                if (i < 4) containers[i].innerHTML = array[1];
            }

            // Display Metro layout boxes
            var totalContent = '';
            var metroContainer = document.getElementById('metro');

            // Assign maximum amount of metro boxes per column
            var maxBoxCount = 4;
            if (metroContainer.clientHeight < 300) maxBoxCount = 3;
            if (metroContainer.clientHeight >= 300 && metroContainer.clientHeight < 450) maxBoxCount = 4;
            if (metroContainer.clientHeight >= 450 && metroContainer.clientHeight < 600) maxBoxCount = 6;

            // Loop through entire array, incrementing by max box number
            for (var columnStart = 0; columnStart < metroNodes.length;) {
                // Create column element
                totalContent += '<div class=\"column\">';
                // Add boxes to column element (L as in Element)
                for (var l = columnStart; l < (columnStart + maxBoxCount); l++) {
                    if (metroNodes[l]) totalContent += metroNodes[l];
                }
                totalContent += '</div>';
                columnStart += maxBoxCount;
            }
            metroContainer.innerHTML = totalContent;
        } else {
            // TODO: Handle lack of events
        }
    });

    $(document).on('click', '.metro-box', function (callback) {
        window.location.replace('event.html?event=' + callback.currentTarget.id);
    });
}

/**
 * Creates two forms of elements which are able to be integrated into the calendar layout.
 * The first of which is a "box" element, for use in the main "Metro" layout.
 * The second is a "card" element, for use in the "upcoming events" bar.
 *
 * @param event An event whose details are to be used in the creation of a node
 * @returns {string[]} An array containing two items: a box type element and a card type element
 */
function createMetroNode(event) {
    var when = event.start.dateTime;
    var shortWhen;
    var summary = event.summary;
    var box = '<div id=\"' + event.id + '\" class=\"metro-box\">';
    var card = '';

    if (!when) {
        // Use the event's date
        var eventDate = event.start.date.substring(6).split('-');
        when = appendSuffix(eventDate[1]) + " of " + getMonthString(eventDate[0]);
        shortWhen = appendSuffix(eventDate[1]);
    } else if (event.start.dateTime.substring(8, 10) != new Date(Date.now()).getDate()) {
        // Use the event's date
        var date = event.start.dateTime.substring(5, 10).split('-');
        when = appendSuffix(date[1]) + " of " + getMonthString(date[0]);
        shortWhen = appendSuffix(date[1]);
    } else {
        // Use the event's time
        when = event.start.dateTime.substring(12, 16);
        shortWhen = when;
    }

    // Check event description for icons and prepare to display them
    if (event.description && event.description.includes(':icon:')) {
        var icon = '<i class=\"' + event.description.split(':icon:').pop() + '\"></i>'
    }

    // Split long summaries into several lines
    if (summary.length > 11) {
        summary = '';
        var array = event.summary.toString().split(' ');
        for (var j = 0; j < array.length; j++) {
            if (j == array.length - 1) summary = summary + array[j];
            else summary = summary + array[j] + '<br>';
        }
    }

    // Append event data to sidebar and metro container objects
    if (icon) {
        card = '<p>' + when + '</p>' + icon + '<div><p>' + summary + '</p></div>';
        box += icon;
        icon = null;
    } else {
        card = '<p>' + when + '</p><div><p>' + summary + '</p></div>';
        box += '<h1>' + shortWhen + '</h1>';
    }
    box += '</div>';
    return [box, card];
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