var CLIENT_ID = '181541807019-nhjd1lbck6osq7qnt3meoj7mstr8jstr.apps.googleusercontent.com';
var SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/plus.login';

/**
 * Force the use of Transport Layer Security (SSL/HTTPS) on a particular page
 */
function forceTLS() {
    var host = window.location.host;
    if ((host == 'psgs.github.io' || host == 'psgs.tk') && (window.location.protocol != 'https:'))
        window.location.protocol = 'https';
}

/**
 * Appends a suffix to a number, for example, the number 3
 * returns "3rd"
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
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

/**
 * Gets the ID of an event from the window's URL
 *
 * @returns {string} The ID of an event
 */
function getEventParameter() {
    var parameters = window.location.search.split('&');
    for (var i = 0; i < parameters.length; i++) {
        if (parameters[i].length > 6) {
            if (parameters[i].substring(1, 7) === 'event=') return parameters[i].substring(7);
        }
    }
    return null;
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
    } else if (event.start.dateTime.substring(8, 10) != new Date(Date.now()).getDate() || event.start.dateTime.substring(5, 7) != new Date(Date.now()).getMonth()) {
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
    // Error: Length property can result in undefined error
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
        card = '<span>' + when + '</span>' + icon + '<div><span>' + summary + '</span></div>';
        box += icon;
        icon = null;
    } else {
        card = '<span>' + when + '</span><div><span>' + summary + '</span></div>';
        box += '<h1>' + shortWhen + '</h1>';
    }
    box += '</div>';
    return [box, card];
}

/**
 * Places event cards returned from createMetroNode() into the
 * sidebar of a page.
 */
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
            var containers = document.querySelector('.sidebar').getElementsByClassName('upcoming');

            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var array = createMetroNode(event);
                if (i < 4) containers[i].querySelector('.text-wrapper').innerHTML = array[1];
            }
        }
        $('.text-wrapper span').textfill({minFontPixels: 200});
    });
}

/**
 * Allows DOM elements to be removed with ease
 * For more information, please see
 * http://stackoverflow.com/questions/3387427/remove-element-by-id
 */
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};