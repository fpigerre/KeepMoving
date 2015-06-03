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

/**
 * This allows the use of .remove(); for DOM elements.
 * More information can be found at:
 * http://stackoverflow.com/questions/3387427/remove-element-by-id
 */
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};