let userLong = 48.490857959077275;
let userLat = -123.4162247313942;
let map = L.map('map').setView([userLong, userLat], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//create the map here, add the tileLayer


let myIcon = L.icon({
    iconUrl: 'images/person.png',
    iconSize: [36, 36],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94],
    title: "myLocation",
    clickable: true,
    zIndexOffset: 500
});
//Store icon info into myIcon

let findUserLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
        let userLat = position.coords.latitude;
        let userLong = position.coords.longitude;

        localStorage.setItem("userLat", userLat);
        localStorage.setItem("userLong", userLong);

        const userLocation = L.marker(
            [userLat, userLong],
            {icon: myIcon}).addTo(map);
        userLocation.setLatLng([userLat, userLong]);
    })
    //generate the icon on the map
}
//a method to find user's current location

findUserLocation();
// call findUserLocation method to find the user location and add the marker.


let airportIcon = L.icon({
        iconUrl: 'images/airplane.jpg',
        iconSize: [36, 36],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowSize: [68, 95],
        shadowAnchor: [22, 94],
        title: "myLocation",
        clickable: true,
        zIndexOffset: 500
    }
)
//store airplane icon info into airportIcon

let convertToDecimalDegree = (coordination) => {
    let lat = coordination.substring(0, 5);
    let long = coordination.substring(6);


    let latDegree = parseInt(lat.substring(0, 2));
    let latMinute = parseInt(lat.substring(2, 4));
    let latDirection = lat.charAt(4);
    // console.log(latDirection)

    let longDegree;
    let longMinute;
    let longDirection;

    // console.log(long.length)

    if (long.length <= 5) {
        longDegree = parseInt(long.substring(0, 2));
        longMinute = parseInt(long.substring(2, 4));
        longDirection = long.charAt(4);
        // console.log(long)
        // console.log(longDirection)
    } else {
        longDegree = parseInt(long.substring(0, 3));
        longMinute = parseInt(long.substring(3, 5));
        longDirection = long.charAt(5);
        // console.log(long)
        // console.log(longDirection)
    }
    let latDecimal = latDegree + latMinute / 60;
    let longDecimal = longDegree + longMinute / 60;
    //get the lat and long decimal through the calculation

    if (latDirection === "S") {
        latDecimal *= -1;
    }

    if (longDirection === "W") {
        longDecimal *= -1;
    }
    return {lat: latDecimal, long: longDecimal};
}
/*this method helps to translate coordinates to decimal degrees*/


let weatherDisplay = async (lat, long, airportInfo, airportLocation) => {
    let apiKey = "552ede3c087c5810a2bbbf22dfea5b8c";
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;

    let response = await fetch(apiUrl);
    let data = await response.json();
    // console.log(data)
    let temp = data.main.temp;
    // console.log(temp);

    airportLocation.bindPopup(`<p>This is ${airportInfo["Airport Name"]} international airport and current Temp is ${temp}</p>`);
}
//method is used to display the weather and temperature information.

let markAirport = () => {

    let obj;
    let locationArray = [];
    //must not be in the fetch,
    fetch('mAirports.json')
        .then(response => {
            return response.json();
        }) // Parses the JSON string into a JavaScript object
        .then(data => {
            obj = data;
            for (const element of obj) {
                let geoLocation = element["Geographic Location"];

                let decimalLocation = convertToDecimalDegree(geoLocation);
                console.log(element["Geographic Location"]);

                localStorage.setItem("airportLat", decimalLocation.lat);
                localStorage.setItem("airportLong", decimalLocation.long);

                const airportLocation = L.marker(
                    [decimalLocation.lat, decimalLocation.long],
                    {icon: airportIcon}).addTo(map);
                // set the marker for all the airports
                // airportLocation.setLatLng([decimalLocation.lat, decimalLocation.long]);
                //set the lat and long for airport.

                // weatherDisplay(decimalLocation.lat, decimalLocation.long, element);
                // weatherDisplay(decimalLocation.lat, decimalLocation.long, element, airportLocation);
                //     make sure to pass airportLocation, so it can be attached with the popup.


                let distance = $("#distance");
                airportLocation.on("click", () => {

                    if (locationArray.length < 2) {
                        locationArray.push(decimalLocation);

                        if (locationArray.length === 2) {
                            let latlng1 = L.latLng(locationArray[0].lat, locationArray[0].long);
                            let latlng2 = L.latLng(locationArray[1].lat, locationArray[1].long);
                            let distanceBetween = map.distance(latlng1, latlng2);
                            createPolyLine(latlng1, latlng2);
                            distance.html(`${distanceBetween}`);
                            // distance method of leaflet
                            locationArray = [];
                        }
                    } else {
                        locationArray = [decimalLocation];

                    }
                })
            }
        })

    // Do something with the data

}

markAirport();

let createPolyLine = (airport1,airport2) => {
    let airLatlng1 = airport1;
    let airLatLng2 = airport2;

    let latlngs = [airLatlng1, airLatLng2];

    let ployLine = L.polyline(latlngs, {color:"red"}).addTo(map);

}
// createPolyLine();

let flightDisplay = $("#flightDisplay");

let getFakeFlightData = () => {
    fetch("fake_flights.json").then((response) => {
        return response.json()
    }).then(data =>{
        const obj = data;
        console.log(obj.at(0))
        for (const element in obj) {
            let flightInfo = element;
            console.log(flightInfo)
        }


    })
}

getFakeFlightData();







