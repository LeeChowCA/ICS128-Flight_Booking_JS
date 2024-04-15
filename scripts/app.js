let userLong = 48.490857959077275;
let userLat = -123.4162247313942;
let map = L.map('map').setView([userLong, userLat], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//create the map here, add the tileLayer


let myIcon = L.icon({
    iconUrl: 'public/images/person.png',
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
        iconUrl: 'public/images/airplane.jpg',
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

    let longDegree;
    let longMinute;
    let longDirection;


    if (long.length <= 5) {
        longDegree = parseInt(long.substring(0, 2));
        longMinute = parseInt(long.substring(2, 4));
        longDirection = long.charAt(4);

    } else {
        longDegree = parseInt(long.substring(0, 3));
        longMinute = parseInt(long.substring(3, 5));
        longDirection = long.charAt(5);

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
    let apiKey = "16a6b6c6c23e8474784ca7b57acb05ed";
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;

    let response = await fetch(apiUrl);
    let data = await response.json();
    let temp = data.main.temp;

    airportLocation.bindPopup(`<p>This is ${airportInfo["Airport Name"]} international airport and current Temp is ${temp}</p>`);
}
//method is used to display the weather and temperature information.

let flightDisplay = $("#flightDisplay");
let buttonId = 0;

let populateFlight = (element, distanceBetween) => {
    let display = "";


    display += (`<div class="col">
                               <div class="card mt-3" style="width: 18rem;" >
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
                                    
                                    <button id="button${buttonId}" type="button" onclick='bookFlight("${element["type_of_plane"]}", "${element["speed_kph"]}", "${element["price_per_km"]}", "${element["extraFuelCharge"]}", "${Math.round(element["price_per_km"] * distanceBetween / 1000)}", "${Math.round(distanceBetween / 10 / element["speed_kph"])}")' class="btn btn-secondary"  data-bs-toggle="offcanvas" data-bs-target="#offcanvasShoppingCart">Book
                                    </button>
<!--                                    the format of onclick is important-->
                                  </div>
                               </div>
                            </div>`);
    buttonId++;
    return display;
}
//call this method to display the flight

let cart = {
};

// Function to book a flight
const bookFlight = (flightType, speed, pricePerKm, extraFuelCharge, totalPrice, duration) => {

    // let cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (cart[flightType]) {
        // Check if the flight is already in the cart
        cart[flightType].quantity += 1; // Increment the quantity
    } else {
        cart[flightType] = {
            quantity: 1,
            type: flightType,
            speed: speed,
            pricePerKm: pricePerKm,
            extraFuelCharge: extraFuelCharge,
            totalPrice: totalPrice,
            duration: duration
        };
        // If not in the cart, add it with a quantity of 1
    }
    // localStorage.setItem("cart", JSON.stringify(cart));

    renderCart(); // Update the cart display
}

const renderCart = () => {
    // let cart = JSON.parse(localStorage.getItem("cart")) || {};

    const cartElement = $("#cart");
    // The element where the cart is displayed
    cartElement.empty();
    // Clear existing cart items

    Object.values(cart).forEach(item => {
        cartElement.append(`
            <div>
                <p>Flight Type: ${item.type}</p>
                <div class="d-flex align-items-center">
                    <button class="btn btn-primary btn-sm" onclick="changeQuantity('${item.type}', -1)">-</button>
                    <span class="px-3">${item.quantity}</span>
                    <button class="btn btn-primary btn-sm" onclick="changeQuantity('${item.type}', 1)">+</button>
                </div>
            </div>
        `);
    });
    // Iterate through the cart object to display each item
}

const changeQuantity = (flightType, change) => {

    // let cart = JSON.parse(localStorage.getItem("cart")) || {};
    if (cart[flightType]) {
        cart[flightType].quantity += change;
        if (cart[flightType].quantity < 1) {
            delete cart[flightType];
            // Remove the flight from the cart if quantity is zero
        }

        // localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        // Re-render the cart to reflect the change
    }
}

const removeAll = $("#removeAll");

removeAll.on("click", () => {
    removeCart();
})
//attach removeCart method to removeAll button

let removeCart = () => {
    cart = {};
    $("#cart").html("");
}
//method to remove all items in the shopping cart


const twoHoursAbove = $("#twoHoursAbove");
const twoHoursBelow = $("#twoHoursBelow");
const belowOneGrand = $("#belowOneGrand");
const aboveOneGrand = $("#aboveOneGrand");
const airBus = $("#airBus");
const boeing = $("#boeing");


let filterDisplay = (data, timeLength, distanceBetween, price) => {
    twoHoursAbove.on("click", () => {

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
    twoHoursBelow.on("click", () => {

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
    fetch("public/fake_flights.json").then((response) => {
        return response.json()
    }).then(data => {

        let display = ``;

        for (const element of data) {

            display += populateFlight(element, distanceBetween);
            filterDisplay(data, Math.round(distanceBetween / 10 / element["speed_kph"]), distanceBetween, Math.round(element["price_per_km"] * distanceBetween / 1000));
            //call filterDisplay method to add click listener to all the dropdown buttons
        }
        //store card info into display variable

        $("#filterBtnDisplay").removeClass("d-none");
        //display the button after user clicking 2 airports
        flightDisplay.append(`${display}`);
        //     display the cards.
        flightDisplay.hide().fadeIn("4000");
    }).catch(error => console.error(error));
}
// method to display the flight info


let markAirport = () => {

    let obj;
    let locationArray = [];
    //must not be in the fetch,
    fetch('public/mAirports.json')
        .then(response => {
            return response.json();
        }) // Parses the JSON string into a JavaScript object
        .then(data => {


            obj = data;
            for (const element of obj) {
                let geoLocation = element["Geographic Location"];
                let decimalLocation = convertToDecimalDegree(geoLocation);

                localStorage.setItem("airportLat", decimalLocation.lat);
                localStorage.setItem("airportLong", decimalLocation.long);

                const airportLocation = L.marker(
                    [decimalLocation.lat, decimalLocation.long],
                    {icon: airportIcon}).addTo(map);
                airportLocation.on("click", () => {
                    weatherDisplay(decimalLocation.lat, decimalLocation.long, element, airportLocation);
                })
                // set the marker for all the airports
                // airportLocation.setLatLng([decimalLocation.lat, decimalLocation.long]);
                //set the lat and long for airport.

                // weatherDisplay(decimalLocation.lat, decimalLocation.long, element);

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


const loginForm = document.getElementById("loginForm");

const firstNameInput = document.getElementById("firstName");
const secondNameInput = document.getElementById("secondName");
const secondNameTest = RegExp("^[A-Za-z]+$");
const emailInput = document.getElementById("email");
const emailTest = RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
const ageInput = document.getElementById("age");
const ageTest = RegExp("^(?:120|[1-9]?[0-9])$");
const phoneInput = document.getElementById("phoneNumber");
const phoneTest = RegExp("^\\d{3}(-|\\s)?\\d{3}(-|\\s)?\\d{4}$");
const postalInput = document.getElementById("postalCode");
const postalTest = RegExp("^[ABCEGHJKLMNPRSTVXY]\\d[ABCEGHJKLMNPRSTVWXYZ](?:\\s?\\d[ABCEGHJKLMNPRSTVWXYZ]\\d)?$");

let firstNameVerify = false;
let secondNameVerify = false;
let emailVerify = false;
let ageVerify = false;
let phoneVerify = false;
let postalVerify = false;


loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (firstNameInput.value.includes(" ") || firstNameInput.value === "") {
        firstNameInput.classList.add("is-invalid"); // Add the is-invalid class
    } else {
        firstNameInput.classList.remove('is-invalid');
        firstNameVerify = true;// Remove the class if the input passes validation
    }

    if (secondNameTest.test(secondNameInput.value)) {
        secondNameInput.classList.remove("is-invalid");
        secondNameVerify = true;
    } else {
        secondNameInput.classList.add("is-invalid");
    }

    if (ageTest.test(ageInput.value)) {
        ageInput.classList.remove("is-invalid");
        ageVerify = true;
    } else {
        ageInput.classList.add("is-invalid");
    }

    if (emailTest.test(emailInput.value)) {
        emailInput.classList.remove("is-invalid");
        emailVerify = true;
    } else {
        emailInput.classList.add("is-invalid");
    }

    if (phoneTest.test(phoneInput.value)) {
        phoneInput.classList.remove("is-invalid");
        phoneVerify = true;
    } else {
        phoneInput.classList.add("is-invalid");
    }

    if (postalTest.test(postalInput.value)) {
        postalInput.classList.remove("is-invalid");
        postalVerify = true;
    } else {
        postalInput.classList.add("is-invalid");
    }

    if (firstNameVerify && secondNameVerify && ageVerify && emailVerify && phoneVerify && postalVerify) {
        document.getElementById("loginForm").setAttribute("class","was-validated");
        submitButton.setAttribute("data-bs-dismiss", "modal");
        document.getElementById("allVerifiedMessage").innerHTML = `<span style="color: goldenrod">info is correct</span> `;
        document.getElementById("welcomeMessage").classList.remove("d-none");
        document.getElementById("welcomeMessage").innerHTML = `Hello, ${firstNameInput.value} ${secondNameInput.value}`;
        document.getElementById("welcomeMessage").style.color = "white";

        $("#flightInfoDisplayBtn").removeClass("d-none");
        $("#submitButton").addClass("d-none");
        const flightCheckOutInfo = $("#flightCheckOutInfo")
        flightCheckOutInfo.empty();

        for (const key in cart ){
            const element = cart[key];

            flightCheckOutInfo.append(`
                                        <p>Duration: ${element.duration}</p>
                                        <p>FlightType: ${element.type}</p>
                                        <p>Speed: ${element.speed}</p>
                                        <p>Price Per Km: ${element.pricePerKm}</p>
                                        <p>Extra Fuel Charge: ${element.extraFuelCharge}</p>
                                        <p>Quantity: ${element.quantity}</p>
                                        <p>Total Price: ${element.totalPrice * element.quantity} </p>
                                      `)
        }
        //display flight info in the cart into the modal flightCheckOutInfo

    }
    //if all the info is correct then we can proceed to show user the flight info
})

const congratulationModelDisplay = $("#congratulationModelDisplay");

congratulationModelDisplay.on("click", () => {

})
