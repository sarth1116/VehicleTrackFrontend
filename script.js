let map;
let vehicleMarker;
let path = [];
let index = 0;
let interval;
let traveledPath; // Polyline to show the path traveled

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 19.0760, lng: 72.8777 }, // Center at Mumbai
        zoom: 10
    });

    vehicleMarker = new google.maps.Marker({
        position: { lat: 19.0760, lng: 72.8777 },
        map: map,
        icon: "https://img.icons8.com/color/30/000000/car.png"
    });

    // Initialize an empty polyline for the traveled path
    traveledPath = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#FF0000", // Color of the polyline
        strokeOpacity: 0.6,
        strokeWeight: 4
    });
    traveledPath.setMap(map);

    fetchRouteData();
}

function fetchRouteData() {
    fetch("https://vehicle-track-backend.vercel.app/api/route")
        .then(response => response.json())
        .then(data => {
            path = data.map(coord => new google.maps.LatLng(coord.latitude, coord.longitude));
            startVehicleMovement();
        })
        .catch(error => console.error("Error fetching route data:", error));
}

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
                scaledSize: new google.maps.Size(15, 15) // Adjust the size
            },
            title: `Stop ${index + 1}`
        });

        index++;
    }, 4000); // Slows down movement by increasing the delay between main points
}

// Interpolate between two points to create a smooth transition
function moveVehicleSmoothly(start, end) {
    const steps = 100; // Number of steps for smooth movement
    const latStep = (end.lat() - start.lat()) / steps;
    const lngStep = (end.lng() - start.lng()) / steps;

    let stepCount = 0;
    const smoothInterval = setInterval(() => {
        if (stepCount >= steps) {
            clearInterval(smoothInterval);
            vehicleMarker.setPosition(end); // Set final position
            return;
        }

        // Set vehicle's intermediate position
        vehicleMarker.setPosition({
            lat: start.lat() + latStep * stepCount,
            lng: start.lng() + lngStep * stepCount
        });

        // Extend the traveled path with the current position
        const currentPath = traveledPath.getPath();
        currentPath.push(vehicleMarker.getPosition());

        stepCount++;
    }, 40); // Adjust this interval to control smoothness and speed
}

window.initMap = initMap;
