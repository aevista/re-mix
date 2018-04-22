/**
 * Display a list a google calendar events from a public calendar
 *
 * @author brian@qualityshepherd.com
 *
 * USAGE:
 * 1. Add script to html page: <script src="gcal.js"></script>
 * 2. create a div with id 'cal' where you want your events listed: `<div id="cal">`
 * 
 * This is shoutware; if like/use this script, give me a shout and let me know :)
 */

/**
 * A google calendar API Key
 *
 * create this api at: https: //console.developers.google.com
 */
var API_KEY = 'AIzaSyBE1-e9INUTNqGajutEc-FKa4-q9nQRrWk';

/**
 * A google calendar ID
 *
 * get the id from your google calendar > settings
 */
var CALENDAR_ID = 'aevistax@gmail.com';

/** current date object */
var now = new Date();
var from = new Date(); 
var to = new Date();
from.setMonth(now.getMonth() - 2);
to.setMonth(now.getMonth() + 1);
console.log(to);

/**
 * Build a Google Calendar API http request 
 * {@link https://developers.google.com/google-apps/calendar/v3/reference/events}
 */
var request = 'https://www.googleapis.com/calendar/v3/calendars/' +
        CALENDAR_ID +
        '/events?singleEvents=true&orderBy=startTime&fields=items(description%2Csummary%2Clocation%2Cstart%2ChtmlLink%2Cattachments)' + 
        '&timeMin=' + formatDateTime(from) +
        '&timeMax=' + formatDateTime(to) +
        '&orderBy=startTime' +
        '&key=' +
        API_KEY;

/**
 * add a leading zero to a number
 *
 * @param {int} num - a number (or number string)
 * @returns {string}
 */
function addZero(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return String(num);
}

/**
 * format a date string
 *
 * @param {date object} 
 * @returns {string} formated date string for google's api: yyyy-mm-ddTHH:MM:ss-hh:MM
 */
function formatDateTime(now) {
    var mm = addZero(now.getMonth() + 1);
    var dd = addZero(now.getDate());
    var yyyy = now.getFullYear();
    var HH = addZero(now.getHours()); // military time
    var hh = HH > 12 ? addZero(HH - 12) : HH; // 12 hour time
    var MM = addZero(now.getMinutes());
    var SS = addZero(now.getSeconds());
    return [yyyy, mm, dd].join('-') + 'T' + [HH, MM, SS].join(':') + '-' + [hh, MM].join(':');
}

/**
 * get calendar events using google's calendar api
 *
 * @param {Object} JSON object of event results
 */
function listEvents(events) {
    var calDiv = document.getElementById('cal');
    if (events.items.length > 0) {
        // build the html... 
        var ul = document.createElement('ul');
        for (var i = 0; i < events.items.length; i++) {
            let item = events.items[i];
            console.log(item);
            let date = (item.start.date) ? item.start.date : item.start.dateTime.split('T')[0];
            if (item.start.dateTime) {
                console.log(new Date(item.start.dateTime));
            }
            let li = document.createElement('li');
            li.appendChild(
                document.createElement("p").appendChild(
                    document.createTextNode(dateName(date) + " - ")
                )
            );
            if (item.summary) {
                li.appendChild(document.createTextNode(item.summary));
            }
            if (item.description) {
                let description = document.createElement('p');
                description.appendChild(document.createTextNode(item.description));
                li.appendChild(description);
            }
            if (item.location) {
                let location = document.createElement('p');
                location.appendChild(document.createTextNode(item.location));
                li.appendChild(location);
            }

            ul.appendChild(li);
        }
        calDiv.appendChild(ul);
    } else {
        document.createTextNode('No upcoming events found...');
    }
}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function dateName(date) {
    var d = date.split('-');
    return monthNames[parseInt(d[1])] + " " + d[2] + ", " + d[0];
}

/**
 * javascript native async requester.
 *
 * @param {string} request url
 * @param {function} callback function to handle response
 * @returns {json} response
 */
function httpGet(url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.onreadystatechange = function(oEvent) {
        if (oReq.readyState === 4 && oReq.status === 200) {
            // callback when we get response... 
            return callback(JSON.parse(oReq.responseText));
        } else {
            console.log("Response: ", oReq.status);
        }
    };
    oReq.send();
}

// build the request, make the async call, and callback listEents with results...
httpGet(request, listEvents);