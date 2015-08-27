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
 * Hook into the Google+ API and update the displayed name
 */
function initializeProfileData() {
    var profileRequest = gapi.client.plus.people.get({'userId': 'me'});
    profileRequest.execute(function (response) {
        updateName(response.displayName);
    });
}