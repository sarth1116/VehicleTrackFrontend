let map;
let vehicleMarker;
let path = [];
let index = 0;
let interval;
let traveledPath; // Polyline to show the path traveled

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 19.0760, lng: 72.8777 }, // Center at Mumbai
        zoom: 10
    });

    // Initialize the vehicle marker with an icon and initial position
    vehicleMarker = new google.maps.Marker({
        position: { lat: 19.0760, lng: 72.8777 },
        map: map,
        icon: "https://img.icons8.com/color/30/000000/car.png"
    });

    // Initialize an empty polyline for the traveled path
    traveledPath = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#FF0000", // Path color
        strokeOpacity: 0.6,
        strokeWeight: 4
    });
    traveledPath.setMap(map);

    // Fetch route data from the backend
    fetchRouteData();
}

// Fetch route data from the backend
function fetchRouteData() {
    fetch("https://vehicle-track-backend.vercel.app/api/route") // Use your backend URL
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            // Map data points into path coordinates
            path = data.map(coord => new google.maps.LatLng(coord.latitude, coord.longitude));
            startVehicleMovement();
        })
        .catch(error => console.error("Error fetching route data:", error));
}

// Start moving the vehicle marker along the route
function startVehicleMovement() {
    index = 0;
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
        if (index >= path.length - 1) {
            clearInterval(interval);
            return;
        }

        // Move the vehicle from the current point to the next one with a smooth animation
        moveVehicleSmoothly(path[index], path[index + 1]);

        // Add a numbered marker at each stop
        new google.maps.Marker({
            position: path[index],
            map: map,
            label: {
                text: `${index + 1}`, // Number each stop
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
            },
            icon: {
                url: "https://img.icons8.com/emoji/48/000000/red-circle-emoji.png", // Custom icon for stops
                scaledSize: new google.maps.Size(15, 15) // Adjust size
            },
            title: `Stop ${index + 1}`
        });

        index++;
    }, 4000); // Adjust delay between main points
}

// Smoothly transition the vehicle between two points
function moveVehicleSmoothly(start, end) {
    const steps = 100;
    const latStep = (end.lat() - start.lat()) / steps;
    const lngStep = (end.lng() - start.lng()) / steps;

    let stepCount = 0;
    const smoothInterval = setInterval(() => {
        if (stepCount >= steps) {
            clearInterval(smoothInterval);
            vehicleMarker.setPosition(end);
            return;
        }

        // Calculate next position
        const newLat = start.lat() + latStep * stepCount;
        const newLng = start.lng() + lngStep * stepCount;
        const newPos = { lat: newLat, lng: newLng };

        vehicleMarker.setPosition(newPos);
        traveledPath.getPath().push(newPos);  // Update traveled path

        stepCount++;
    }, 40); // Adjust interval to control speed and smoothness
}

// Ensure initMap is available globally
window.initMap = initMap;
