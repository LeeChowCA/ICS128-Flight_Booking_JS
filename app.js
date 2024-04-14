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

let flightDisplay = $("#flightDisplay");

let populateFlight = (element, distanceBetween) => {
    let display = "";

    display += (`<div class="col">
                               <div class="card mt-3" style="width: 18rem;">
                                  <img src="${element.image}" class="card-img-top" alt="flight">
                                  <div class="card-body">
                                    <p class="card-text">speed: ${element["speed_kph"]} kph</p>
                                    <p class="card-text">type of plane: ${element["type_of_plane"]}</p>
                                    <p class="card-text">seats remaining: ${element["seats_remaining"]}</p>
                                    <p class="card-text">costs per KM: ${element["price_per_km"]}</p>
                                    <p class="cardd-text">extraFuelCharge${element["extraFuelCharge"]}</p>
                                    <p class="cardd-text">max TakeOff Alt is ${element["maxTakeOffAlt"]}</p>
                                    <p class="cardd-text">duration of flight is ${Math.round(distanceBetween / 10 / element["speed_kph"])} min</p>
                                    <p class="cardd-text">total cost is ${Math.round(element["price_per_km"] * distanceBetween / 1000)} </p>
                                    
                                    <button type="button" class="btn btn-secondary">Book</button>
                                  </div>
                               </div>
                            </div>`);
    return display;
}
//call this method to display the flight

const twoHoursAbove = $("#twoHoursAbove");
const twoHoursBelow = $("#twoHoursBelow");
const belowOneGrand = $("#belowOneGrand");
const aboveOneGrand = $("#aboveOneGrand");
const airBus = $("#airBus");
const boeing = $("#boeing");


let filterDisplay = (data, timeLength, distanceBetween, price) => {
    twoHoursAbove.click(() => {

        //empty the display
        let display = "";

        for (const element of data) {
            if (distanceBetween / 10 / element["speed_kph"] > 120) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable

        }
        flightDisplay.html(`${display}`);
        //     display the cards.

    })
    twoHoursBelow.click(() => {

        //empty the display
        let display = "";


        for (const element of data) {
            if (distanceBetween / 10 / element["speed_kph"] < 120) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable
        }
        flightDisplay.html(`${display}`);
        //     display the cards.
    })

    belowOneGrand.click(() => {

        //empty the display
        let display = "";

        for (const element of data) {
            if (Math.round(element["price_per_km"] * distanceBetween / 1000) < 1000) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable
        }
        flightDisplay.html(`${display}`);
        //     display the cards.
    })
    aboveOneGrand.click(() => {

        //empty the display
        let display = "";

        for (const element of data) {
            if (Math.round(element["price_per_km"] * distanceBetween / 1000) > 1000) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable
        }
        flightDisplay.html(`${display}`);
        //     display the cards.
    })

    airBus.click(() => {

        //empty the display
        let display = "";

        for (const element of data) {
            if (element["type_of_plane"].includes("Airbus")) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable
        }
        flightDisplay.html(`${display}`);
        //     display the cards.
    })
    boeing.click(() => {

        //empty the display
        let display = "";

        for (const element of data) {
            if (element["type_of_plane"].includes("Boeing")) {
                display += populateFlight(element, distanceBetween);
            }
            //store card info into display variable
        }
        flightDisplay.html(`${display}`);
        //     display the cards.
    })



}
// filter method

let getFakeFlightData = (distanceBetween) => {
    fetch("fake_flights.json").then((response) => {
        return response.json()
    }).then(data => {

        let display = "";
        for (const element of data) {

            display += populateFlight(element, distanceBetween);
            filterDisplay(data, Math.round(distanceBetween / 10 / element["speed_kph"]), distanceBetween, Math.round(element["price_per_km"] * distanceBetween / 1000));
            //call filterDisplay method to add click listener to all the dropdown buttons
        }
        //store card info into display variable
        flightDisplay.html(`${display}`);
        //     display the cards.
        flightDisplay.fadeIn("4000");


    })
}
// method to display the flight info


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
                            distance.html(`${Math.round(distanceBetween / 1000)} km`);
                            // distance method of leaflet
                            locationArray = [];
                            getFakeFlightData(distanceBetween);
                            //call the function to display the masonry cards.


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


let createPolyLine = (airport1, airport2) => {
    let airLatlng1 = airport1;
    let airLatLng2 = airport2;

    let latlngs = [airLatlng1, airLatLng2];

    let ployLine = L.polyline(latlngs, {color: "red"}).addTo(map);

}
// createPolyLine();











