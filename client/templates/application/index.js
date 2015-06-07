if (Meteor.isClient) {
    Meteor.loginWithGoogle({requestPermissions: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/plus.login'], forceApprovalPrompt: true})
    var CLIENT_ID;
    var SCOPES;

    $(document).ready(function () {
        Template.index.onRendered(function () {
            window.setTimeout(function () {
                loadInformation();
                checkAuth();
            }, 5000);
        });
    });

    /**
     * Gets Google API Client ID and Scope data from a JSON file.
     */
    function loadInformation() {
        $.getJSON('information.json', function (data) {
            CLIENT_ID = data.CLIENT_ID;
            SCOPES = data.SCOPES;
            console.log("Scope success");
        });
    }

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
        console.log("Auth success");
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
// TODO: Integrate other windows
    function loadCalendarData() {
        console.log("Success!");
        // Set parameters for data collection
        var window = 'month';
        var today = new Date(Date.now());
        var minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var maxDate;
        switch (window) {
            case 'day':
                maxDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + 1);
                break;

            case 'month':
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
                var metroNode = '';
                var nodes;

                for (var i = 0; i < container.length; i++) {
                    var event = events[i];
                    var when = event.start.dateTime;
                    var shortWhen;
                    var summary = event.summary;
                    metroNode = metroNode + '<div class=\"metro-box\">';

                    if (!when) {
                        // Use the event's date
                        var eventDate = event.start.date.substring(6).split('-');
                        when = appendSuffix(eventDate[1]) + " of " + getMonthString(eventDate[0]);
                        shortWhen = appendSuffix(eventDate[1]);
                    } else if (event.start.dateTime.substring(8, 10) != today.getDate()) {
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
                        var array = event.summary.split(' ');
                        for (var j = 0; j < array.length; j++) {
                            if (j == array.length - 1) summary = summary + array[j];
                            else summary = summary + array[j] + '<br>';
                        }
                    }

                    // Append event data to sidebar and metro container objects
                    if (icon) {
                        container[i].innerHTML = '<h3>' + when + '</h3>' + icon + '<p>' + summary + '</p>';
                        metroNode = metroNode + icon;
                        icon = null;
                    } else {
                        container[i].innerHTML = '<h3>' + when + '</h3><p>' + summary + '</p>';
                        metroNode = metroNode + '<h1>' + shortWhen + '</h1>';
                    }

                    metroNode = metroNode + '</div>';
                    nodes.push(metroNode);
                }
                // Display Metro Box icon/time
                //document.getElementById('metro').innerHTML = metroNode;

                console.log(nodes);
                Template.index.helpers({
                    boxes: [
                        {html: nodes[1]},
                        {html: nodes[2]},
                        {html: nodes[3]},
                        {html: nodes[4]}
                    ]
                });
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
}

/**
 * Appends a suffix to a number, for example, the number 3
 * returns "3rd".
 *
 * @param i A number
 * @returns {string} The number with a suffix attached
 */
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

/**
 * Gets the name of a month from an integer
 *
 * @param i An integer between 1 and 12
 * @returns {string} The name of a month, formatted as a string
 */
function getMonthString(i) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    i = parseInt(i, 10);
    return monthNames[i];
}

/**
 * Gets the name of a day from an integer
 *
 * @param i An integer between 1 and 7
 * @returns {string} The name of a day, formatted as a string
 */
function getDayString(i) {
    var dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    i = parseInt(i, 10);
    return dayNames[i];
}

/**
 * Update the main page with a friendly greeting featuring the
 * user's first name.
 *
 * @param fullName {string} The user's full name
 */
function updateName(fullName) {
    var greetings = ["Hi", "Hello", "Hey", "Howdy", "G'day"];

    var date = new Date(Date.now());
    if (date.getHours() > 6 && date.getHours() < 12) greetings.push("Good morning");
    if (date.getHours() > 12 && date.getHours() < 18) greetings.push("Good afternoon");
    if (date.getHours() > 18 && date.getHours() < 21) greetings.push("Good evening");

    var firstName = fullName.split(' ')[0];
    document.getElementById('name').innerHTML
        = greetings[Math.floor(Math.random() * greetings.length)]
        + " "
        + firstName
        + "!";
}

/**
 * Launch a real-time clock
 */
function launchClock() {
    var time;
    var date = new Date(Date.now());

    document.getElementById('date').innerHTML
        = getDayString(date.getDay())
        + ' '
        + appendSuffix(date.getDate())
        + ' of '
        + getMonthString(date.getMonth());

    setInterval(function () {
        time = new Date(Date.now());
        document.getElementById('time').innerHTML = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        time = null;
    }, 900);
}