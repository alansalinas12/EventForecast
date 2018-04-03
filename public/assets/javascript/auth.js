var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/calendar';

var database = firebase.database();

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

  function setSigninStatus(isSignedIn) {
      var user = GoogleAuth.currentUser.get();
      var isAuthorized = user.hasGrantedScopes(SCOPE);
      if (isAuthorized) {
          $('#sign-in-or-out-button').html('Sign out');
          $('#revoke-access-button').css('display', 'inline-block');
          $('#auth-status').html('You are currently signed in and have granted ' +
              'access to this app.');
        var userId = user.El;
        console.log(user);
        database.ref().child('Users/').child(userId).set({
            name: user.w3.ig,
            email: user.w3.U3
        });
        gapi.client.calendar.events.list({
              'calendarId': 'primary',
              'timeMin': (new Date()).toISOString(),
              'showDeleted': false,
              'singleEvents': true,
              'maxResults': 10,
              'orderBy': 'startTime'
          }).then(function (response) {
              var events = response.result.items;
              var userEvents = [];
              if (events.length > 0) {
                  for (i = 0; i < events.length; i++) {
                      var event = events[i];
                      var when = event.start.dateTime;
                      if (!when) {
                          when = event.start.date;
                      }
                      var newEvent = {
                          title: event.summary,
                          
                          start: when
                      };
                      userEvents.push(newEvent);                     
                  }
              }
              database.ref().child('Users/').child(userId).child('events/').set(userEvents);
          })
      } else {
          $('#sign-in-or-out-button').html('Sign In/Authorize');
          $('#revoke-access-button').css('display', 'none');
          $('#auth-status').html('You have not authorized this app or you are ' +
              'signed out.');
      }
      
  }

  function updateSigninStatus(isSignedIn) {
      setSigninStatus();
  }



