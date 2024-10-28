let map;
let vehicleMarker;
let path = [];
let returnPath = [];
let currentPath = [];
let index = 0; // Current index for vehicle movement
let interval; // Store the interval for movement
let outgoingPathPolyline; // Polyline for outgoing path
let returnPathPolyline; // Polyline for return path

// Define the initMap function globally
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 19.0760, lng: 72.8777 }, // Start point (Mumbai)
        zoom: 10,
    });

    vehicleMarker = new google.maps.Marker({
        position: { lat: 19.0760, lng: 72.8777 }, // Initial position (Mumbai)
        map: map,
        icon: "https://img.icons8.com/color/30/000000/car.png",
    });

    fetchRouteData();
}

// Fetch route data from backend based on selected date
function fetchRouteData() {
    const selectedDate = document.getElementById('datePicker').value; // Get selected date
    fetch(`https://vehicle-track-backend-yrvz.vercel.app/api/route/${selectedDate}`)
        .then((response) => response.json())
        .then((data) => {
            path = data.map(coord => new google.maps.LatLng(coord.latitude, coord.longitude));
            returnPath = path.slice().reverse(); // Create return path by reversing the outgoing path
            
            drawPath(); // Draw both outgoing and return paths
            
            // Start vehicle movement towards the destination
            currentPath = path;
            startVehicleMovement();
        })
        .catch((error) => console.error("Error fetching route data:", error));
}

// Draw the outgoing and return paths on the map
function drawPath() {
    // Draw outgoing path
    outgoingPathPolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 0.6,
        strokeWeight: 4,
    });
    outgoingPathPolyline.setMap(map);

    // Draw return path
    returnPathPolyline = new google.maps.Polyline({
        path: returnPath,
        geodesic: true,
        strokeColor: "#FF0000", 
        strokeOpacity: 0.6,
        strokeWeight: 4,
    });
    returnPathPolyline.setMap(map);
}

// Move the vehicle smoothly along the path
function startVehicleMovement() {
    index = 0; // Reset index to start from the beginning
    if (interval) clearInterval(interval); // Clear any existing interval

    interval = setInterval(() => {
        if (index >= currentPath.length - 1) {
            // Switch to the return path after reaching the destination
            if (currentPath === path) {
                currentPath = returnPath;
                index = 0; // Reset index for return journey
            } else {
                // Stop the vehicle when it returns to the starting point
                clearInterval(interval);
                return;
            }
        }

        // Get the current and next position
        const currentPosition = currentPath[index];
        const nextPosition = currentPath[index + 1];
        
        // Interpolating movement for smooth transitions
        moveVehicleAlongPath(currentPosition, nextPosition);
        index++;
    }, 2000); // Update every 2 seconds
}

// Move the vehicle smoothly between two LatLng points along the path
function moveVehicleAlongPath(start, end) {
    const totalSteps = 100; // Number of steps for smooth movement
    const latDiff = (end.lat() - start.lat()) / totalSteps;
    const lngDiff = (end.lng() - start.lng()) / totalSteps;

    let step = 0;

    const smoothInterval = setInterval(() => {
        if (step >= totalSteps) {
            clearInterval(smoothInterval); // Clear interval when done
            vehicleMarker.setPosition(end); // Set to the end position
            return;
        }
        
        vehicleMarker.setPosition({
            lat: start.lat() + latDiff * step,
            lng: start.lng() + lngDiff * step
        });
        
        step++;
    }, 20); 
}


window.initMap = initMap;
