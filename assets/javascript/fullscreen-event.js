/**
 * Creates a new div that pops up over the main page, allowing the user
 * to view and edit an event that has been created.
 *
 * @param event An event to be edited
 */
function maximizeEvent(event) {
    document.load('event-display.html');
}

/**
 * Closes an event that has been maximized
 *
 * @param event An event that is currently open
 */
function minimizeEvent(event) {
    document.getElementById('fullevent').remove();
}