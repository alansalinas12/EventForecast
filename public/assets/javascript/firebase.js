window.firebase = function () {
    var config = {
        apiKey: "AIzaSyD4VuuZQ2rzCebCtyx46p8Bnv9IpuTbhFA",
        authDomain: "eventforecast.firebaseapp.com",
        databaseURL: "https://eventforecast.firebaseio.com",
        projectId: "eventforecast",
        storageBucket: "",
        messagingSenderId: "51824759816"
    };
    firebase.initializeApp(config);

    return firebase;
}()