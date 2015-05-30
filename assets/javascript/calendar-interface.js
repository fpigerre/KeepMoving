var CLIENT_ID;
var SCOPES;

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    $.getJSON("information.json", function (data) {
        CLIENT_ID = data.CLIENT_ID;
        SCOPES = data.SCOPE;
    });

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
        gapi.client.load('calendar', 'v3', loadCalendarData("day"));
    } else {
        window.location.replace("/authentication.html");
    }
}

// TODO: Integrate other windows
function loadCalendarData(window) {
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
        'maxResults': 100,
        'orderBy': 'startTime'
    });

    request.execute(function (resp) {
        console.log(resp);
        var events = resp.items;
        console.log(events);

        if (events.length > 0) {
            var container = document.getElementsByClassName('.upcoming');
            for (i = 0; i < container.length; i++) {
                var event = events[i];

                container[i].innerHTML = '<h3>' + event.start.dateTime + '</h3><p>' + event.summary + '</p>';
                console.log('<h3>' + event.start.dateTime + '</h3><p>' + event.summary + '</p>');

                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                //appendPre(event.summary + ' (' + when + ')')
            }
        } else {
            //appendPre('No upcoming events found.');
        }
    });
}