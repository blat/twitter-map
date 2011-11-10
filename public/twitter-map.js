var TwitterMap = {}

TwitterMap.init = function() {
    this.initMap();
    this.initSocket();
}

TwitterMap.initMap = function() {
    // Create map
    this.map = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 3,
        center:  new google.maps.LatLng(25, 0),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Create geocoder (needed for non localised tweets)
    this.geocoder = new google.maps.Geocoder();
}

TwitterMap.initSocket = function() {
    // Open web socket
    var socket = new WebSocket('ws://' + document.location.host + ':8080/');

    // Add listeners

    socket.onmessage = function(message) {
        var tweet = JSON.parse(message.data);
        console.log(tweet);
        TwitterMap.addTweet(tweet);
    };

    socket.onopen = function() {
        console.log("Socket opened");
    };

    socket.onclose = function() {
        console.log("Socket closed");
    };
}

TwitterMap.addTweet = function(tweet) {
    if (tweet.geo && tweet.geo.coordinates) {
        // From "geo" field
        var latitude = tweet.geo.coordinates[0];
        var longitude = tweet.geo.coordinates[1];
        this.addMarker(tweet, latitude, longitude);

    } else if (tweet.coordinates && tweet.coordinates.coordinates) {
        //  From "coordinates" field
        var latitude = tweet.coordinates.coordinates[1];
        var longitude = tweet.coordinates.coordinates[0];
        this.addMarker(tweet, latitude, longitude);

    } else if (tweet.place && tweet.place.bounding_box && tweet.place.bounding_box.coordinates) {
        // From "place" field
        var latitude = tweet.place.bounding_box.coordinates[1];
        var longitude = tweet.place.bounding_box.coordinates[0];
        this.addMarker(tweet, latitude, longitude);

    } else if (this.geocoder && tweet.user && tweet.user.location) {
        // From "user.location" field (using google geolocalisation)
        this.geocoder.geocode({address: tweet.user.location }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                TwitterMap.addMarker(tweet, latitude, longitude);
            }
        });
    }
}

TwitterMap.formatTweet = function(tweet) {
    // Replace all @mention by a clickable link
    $.each(tweet.entities.user_mentions, function(key, value) {
        tweet.text = tweet.text.replace('@' + value.screen_name,
            "<a href='http://twitter.com/" + value.screen_name + "' target='_blank'>@" + value.name + "</a>");
    });

    // Replace all #hashtag by a clickable link
    $.each(tweet.entities.hashtags, function(key, value) {
        tweet.text = tweet.text.replace('#' + value.text,
            "<a href='http://twitter.com/search?q=%23" + value.text + "' target='_blank'>#" + value.text + "</a>");
    });

    // Replace all http:// by a clickable link
    $.each(tweet.entities.urls, function(key, value) {
        tweet.text = tweet.text.replace(value.url,
            "<a href='" + value.expanded_url + "' target='_blank'>" + value.display_url + "</a>");
    });

    // Convert date in readable format
    tweet.created_at = new Date(tweet.created_at);
    tweet.created_at = tweet.created_at.toLocaleString().substr(0, 24);

    return tweet;
}

TwitterMap.addMarker = function(tweet, latitude, longitude) {
    // Prepare data
    tweet = this.formatTweet(tweet);

    // Build info window
    var infowindow = new google.maps.InfoWindow({
        content: "<div class='tweet'>" +
            "<a class='avatar' href='http://twitter.com/" + tweet.user.screen_name + "' target='_blank'><img src='" + tweet.user.profile_image_url + "' /></a>" +
            "<a class='name' href='http://twitter.com/" + tweet.user.screen_name + "' target='_blank'>" + tweet.user.name + "</a>" +
            "<a class='date' href='http://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id + "' target='_blank'>" + tweet.created_at + "</a>" +
            "<p class='content'>" + tweet.text + "</p>" +
            "</div>"
    });

    // Add marker
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: this.map,
        title: tweet.text
    });

    // Attach info window on marker
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(this.map, marker);
    });
};
