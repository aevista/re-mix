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
var CALENDAR_ID = '2toneband@gmail.com';

/** current date object */
var now = new Date();
var from = now;
var to = setDate(d => d.getMonth() + 1, (d, k) => d.setMonth(k))(now);

function setDate(getCallback, setCallback) {
    return date => {
        let newDate = new Date(date);
        setCallback(newDate, getCallback(date));
        return newDate;
    }
}

/**
 * Build a Google Calendar API http request 
 * {@link https://developers.google.com/google-apps/calendar/v3/reference/events}
 */
var calender_request = 'https://www.googleapis.com/calendar/v3/calendars/' +
        CALENDAR_ID +
        '/events?singleEvents=true&orderBy=startTime&fields=items(summary%2Clocation%2Cstart%2ChtmlLink)' + 
        '&timeMin=' + formatDateTime(from) +
        '&timeMax=' + formatDateTime(to) +
        '&orderBy=startTime' +
        '&key=' + API_KEY;

function mapsRequest(address) {
    return `https://maps.googleapis.com/maps/api/geocode/json?address=${address.split(' ').join('+')}&key=${API_KEY}`
}

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

const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

function listEvents(events) {
    let eventsId = document.getElementById('events');
    
    if (events.items.length === 0 || !eventsId) {
        return;
    }

    let upcoming = events.items.length === 0 
        ? new Date()
        : new Date(events.items[0].start.date ? events.items[0].start.date : events.items[0].start.dateTime);

    console.log(events.items);

    for (var i = 0; i < events.items.length; i++) {
        let item = events.items[i];
        let date = new Date((item.start.date) ? item.start.date : item.start.dateTime);
    
        let dateString = `${dayNames[date.getDay()]} ${monthNames[date.getMonth()]} ${date.getDate()}`;
        let hour = `${(date.getHours() +1) % 13}`;
        let min = `${date.getMinutes()}`.length === 1 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
        let meridiem = `${date.getHours() >= 12 ? "pm" : "am"}`;

        let name = document.createElement("div");
        name.appendChild(document.createTextNode(`${dateString} - ${hour}:${min} ${meridiem}`));
        let event = document.createElement('div'); 
        event.appendChild(name);

        if (item.summary) {
            let summary = document.createElement('div');
            summary.classList.add("summary");
            summary.appendChild(document.createTextNode(item.summary));
            event.appendChild(summary);
        }
        
        if (item.location) {
            let location = document.createElement('a');
            location.classList.add("location");
            location.classList.add('popup-gmaps');
            location.href=`${mapsRequest(item.location)}`;
            location.appendChild(document.createTextNode(item.location));
            event.appendChild(location);
        }

        let eventContainer = document.createElement('div');
        eventContainer.classList.add("event");
    
        if (isSameDay(date, upcoming)) {
            
            let upcomingDiv = document.createElement("div");
            upcomingDiv.style.float='clear';
            upcomingDiv.style.marginRight='60%';
            upcomingH = document.createElement("h2");
            upcomingH.innerHTML = "Upcoming Event";
            upcomingDiv.appendChild(upcomingH);
            eventContainer.appendChild(upcomingDiv);
            eventContainer.appendChild(event);
            
        } else {
            eventContainer.appendChild(event);
        }

        eventContainer.classList.add("line")
        eventsId.appendChild(eventContainer);
    }
}

function isSameDay(date, upcoming) {
    return date.getMonth() === upcoming.getMonth() 
        && date.getDate() === upcoming.getDate()
        && date.getFullYear() === upcoming.getFullYear();
}

function mapsRequest(address) {
    return `https://maps.google.com/maps?q=${address.split(' ').join('+')}`;
}


$(document).ready(function() {
    $.ajax({
        url: calender_request, 
        dataType: 'json',
        success: (events) => listEvents(events),
        complete: () => {
            $('.popup-gmaps').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
        
                fixedContentPos: false
            });
        }
    });
});
