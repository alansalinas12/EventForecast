$(document).ready(function () {
    var database = firebase.database();

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: { lat: 30.267, lng: 97.743 }
    });
    var geocoder = new google.maps.Geocoder();

    database.ref("Users/").once("value")
    .then(function(sv) {
        var userkey = sv.val();
        console.log(userkey);
        var userEvents = sv.child("userId/events").val();
        console.log(userEvents);
        userEvents.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {

                var location = childSnapshot.child().key;
                var address = childSnapshot.child("location/address").val();

                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == 'OK') {
                        map.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location
                        });

                        var lat = results[0].geometry.location.lat;
                        var lng = results[0].geometry.location.lng;

                     //   database.child("Users/").child().set({
                     //       lat: lat,
                     //       lng: lng
                     //   })
                    }
                }); 
            })
        })
    }) 
});
