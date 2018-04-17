var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/calendar';
var database = firebase.database();
var userEvents = [];


$(document).ready(function () {
    handleClientLoad();

});

function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
}


function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': 'AIzaSyDuKY_prBggKApm-eoDsPWSDFdMV2qJWQo',
        'discoveryDocs': [discoveryUrl],
        'clientId': '51824759816-2pgjoq7r09ion93gqt4rk5kdul5d9m0m.apps.googleusercontent.com',
        'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);

        // Handle initial sign-in state. (Determine if user is already signed in.)
        var user = GoogleAuth.currentUser.get();
        setSigninStatus();

        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $('#sign-in-or-out-button').click(function () {
            handleAuthClick();
        });
        $('#revoke-access-button').click(function () {
            revokeAccess();
        });
    });
}

function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

function revokeAccess() {
    GoogleAuth.disconnect();
}

function updateSigninStatus(isSignedIn) {
    setSigninStatus();
}

function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');

        gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        }).then(function (response) {
            var events = response.result.items;
            if (events.length > 0) {
                for (i = 0; i < events.length; i++) {
                    var event = events[i];
                    var when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    var newEvent = {
                        title: event.summary,
                        location: {
                            address: event.location
                        },
                        start: moment(when).format('X')
                    };
                    userEvents.push(newEvent);
                }
            }
            geolocate();
        })
    } else {
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }

}

var updatedEvents = [];

function geolocate() {

    var user = GoogleAuth.currentUser.get();
    var userId = user.El;
    var name = user.w3.ig;
    var email = user.w3.U3;

    var lat;
    var lng;

    console.log(user);

    if (userEvents.length > 0) {
        for (i = 0; i < userEvents.length; i++) {
            convertGeocode();
        }
    }
    

}

function convertGeocode() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {
            lat: 30.267,
            lng: 97.743
        }
    });
    var geocoder = new google.maps.Geocoder();
    var event = userEvents[i];
    var address = userEvents[i].location.address;
    var title = userEvents[i].title;
    var start = userEvents[i].start;

    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();

            
                var updatedEvent = {
                    title: title,
                    start: start,
                    address: address,
                    lat: lat,
                    lng: lng
                }
                updatedEvents.push(updatedEvent);
            }
        }); 
    }


var readyEvents = [];

$('#populate').on('click', function() {

    console.log(updatedEvents);
    updatedEvents.forEach(function (event) {
        var latitude = event.lat;
        var longitude = event.lng;
        var time = event.start;
        var timeCalendar = moment(event.start, 'X').format('MMMM Do YYYY, h:mm:ss a');
        var address = event.address;
        var title = event.title;
        var eventLat = event.lat;
        var eventLng = event.lng;

        var weatherURL = "https://api.darksky.net/forecast/36f29f4a18b4bbad3f41032535ed8d43/" + latitude + "," + longitude + "," + time;

        $.ajax({
            url: weatherURL,
            method: "GET",
            dataType: "jsonp"
        }).then(function (response) {
            console.log(response);

            var readyEvent = {
                title: title,
                start: time,
                address: address,
                weather: {
                    temp: response.currently.temperature,
                    summary: response.currently.summary,
                    icon: response.currently.icon
                }

            }
            
            readyEvents.push(readyEvent);

            $('#eventCards').append("<div class='card eventCard'><div class='card-header'>" + timeCalendar + ": " + title + "</div><div class='card-body'><div class='row'><div class='col eventInfo'><h5 class='card-title'>" + address + "</h5><p class='card-text'>Expected Condition: " + readyEvent.weather.summary + " -- Temperature: " + readyEvent.weather.temp + " °F" + "</p></div><div class='col eventIcon'><img class='weatherIcon' src='assets/images/" + readyEvent.weather.icon + ".png'><button type='button' class='btn btn-info mapMarkerBtn' data-button='{lat:" + eventLat + ", lng:" + eventLng + "}'>Map Marker</button></div></div></div></div>");
            
        });
        console.log(readyEvents);
    }) 
})

$("button").on("click", function () {
    var data = $(this).data('button');
    console.log(data);
    var myLatLng = {
        lat: data.lat,
        lng: data.lng
    };

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
    }).setMap('map');
})