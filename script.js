let map;
let directionsService;
let directionsRenderer;

// Initialize the Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.0827, lng: 80.2707 }, // Center map on Chennai
        zoom: 10,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    initAutocomplete();
}

function initAutocomplete() {
    const sourceInput = document.getElementById("source");
    const destinationInput = document.getElementById("destination");

    // Create the Autocomplete object for the source input field
    const sourceAutocomplete = new google.maps.places.Autocomplete(sourceInput);
    sourceAutocomplete.setFields(["place_id", "geometry", "name"]); // Limit the data we need

    // Create the Autocomplete object for the destination input field
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    destinationAutocomplete.setFields(["place_id", "geometry", "name"]); // Limit the data we need

    // Add event listeners to capture when the user selects a location
    sourceAutocomplete.addListener("place_changed", function() {
        const place = sourceAutocomplete.getPlace();
        if (!place.geometry) {
            // User did not select a valid place, handle this case
            alert("Please select a valid source location from the suggestions.");
            return;
        }
    });

    destinationAutocomplete.addListener("place_changed", function() {
        const place = destinationAutocomplete.getPlace();
        if (!place.geometry) {
            // User did not select a valid place, handle this case
            alert("Please select a valid destination location from the suggestions.");
            return;
        }
    });
}


// Fetch route details using Google Maps Directions API
async function getRoute(source, destination) {
    if (!directionsService) {
        console.error("DirectionsService not initialized");
        document.getElementById("details").textContent = "Map service is not ready yet.";
        return;
    }

    try {
        const request = {
            origin: source,
            destination: destination,
            travelMode: google.maps.TravelMode.TRANSIT,
        };

        // Fetch the route
        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                displayBusRoutes(result);
            } else {
                console.error("Error fetching route:", status);
                document.getElementById("details").textContent = `No route found. Status: ${status}`;
            }
        });
    } catch (error) {
        console.error("Error fetching route details:", error);
        document.getElementById("details").textContent = "Error fetching route details.";
    }
}


// Display bus routes from the directions response, including intermediate stops
function displayBusRoutes(result) {
    const detailsDiv = document.getElementById("details");
    detailsDiv.innerHTML = ""; // Clear previous details

    const routes = result.routes[0].legs[0].steps;
    const busRoutes = [];

    routes.forEach((step) => {
        if (step.travel_mode === "TRANSIT" && step.transit) {
            const transitDetails = step.transit;

            if (transitDetails.line.vehicle.type === "BUS") {
                // Extract main bus details
                const busInfo = `
                    <div>
                        <strong>Bus Number:</strong> ${transitDetails.line.short_name} <br>
                        <strong>From:</strong> ${transitDetails.departure_stop.name} <br>
                        <strong>To:</strong> ${transitDetails.arrival_stop.name} <br>
                        <strong>Departure Time:</strong> ${transitDetails.departure_time.text} <br>
                        <strong>Arrival Time:</strong> ${transitDetails.arrival_time.text} <br>
                        <strong>Total Stops:</strong> ${transitDetails.num_stops}
                    </div>
                `;

                busRoutes.push(busInfo);

                
            }
        }
    });

    // Display all the bus route and stops information
    if (busRoutes.length > 0) {
        detailsDiv.innerHTML = busRoutes.join("<hr>");
    } else {
        detailsDiv.textContent = "No bus routes found for the given route.";
    }
}
///




// Handle form submission to fetch the route
document.getElementById("routeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const source = document.getElementById("source").value.trim();
    const destination = document.getElementById("destination").value.trim();

    if (source && destination) {
        getRoute(source, destination);
    } else {
        document.getElementById("details").textContent = "Please enter both source and destination.";
    }
});


// Ensure the map initializes properly
window.initMap = initMap;

/////////////////////////////
