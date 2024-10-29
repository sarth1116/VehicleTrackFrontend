let map;
let vehicleMarker;
let routeCoordinates = [];
let animationSpeed = 30; // Speed of movement (higher = slower)
let stopDelay = 500; // Stop for 0.5 seconds (500 milliseconds)
let currentIndex = 0; // Index to track the vehicle's current position on the route
let vehiclePath = []; // Array to store the path of the vehicle for a trailing effect

// Initialize the Google Map
function initMap() {
  // Initialize the map centered at a specified latitude and longitude
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.0760, lng: 72.8777 },
    zoom: 14,
  });

  // Create a vehicle marker with an icon and initial position
  vehicleMarker = new google.maps.Marker({
    position: {  lat: 19.0760, lng: 72.8777},
    map: map,
    icon: {
      url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png", // Taxi icon
      scaledSize: new google.maps.Size(50, 50), // Resize the icon
    },
  });

  // Fetch the vehicle route data from the backend and start the animation
  fetchVehicleData();
}

// Fetch vehicle movement data from the backend
function fetchVehicleData() {
  fetch("https://vehicle-track-backend.vercel.app/api/vehicle")
    .then((response) => response.json())
    .then((data) => {
      // Map the data to route coordinates
      routeCoordinates = data.map((location) => ({
        lat: location.latitude,
        lng: location.longitude,
      }));

      // Draw the route with markers for each stop
      drawRouteWithMarkers();

      // Start animating the vehicle along the route
      animateVehicle();
    })
    .catch((error) => console.error("Error fetching vehicle data:", error));
}

// Draw the full route and add numbered markers for each stop
function drawRouteWithMarkers() {
  // Draw the route as a polyline
  new google.maps.Polyline({
    path: routeCoordinates,
    geodesic: true,
    strokeColor: "#FF0000", // Route color
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
  });

  // Add numbered markers for each stop along the route
  routeCoordinates.forEach((position, index) => {
    new google.maps.Marker({
      position,
      map: map,
      label: {
        text: `${index + 1}`, // Display stop number (1-based index)
        color: "black",
        fontSize: "16px",
      },
    });
  });
}

// Animate the vehicle marker along the route
function animateVehicle() {
  // Check if there are remaining route points to animate
  if (currentIndex < routeCoordinates.length - 1) {
    const start = routeCoordinates[currentIndex];
    const end = routeCoordinates[currentIndex + 1];

    let stepCount = 100; // Number of steps between two points
    let step = 0;
    let deltaLat = (end.lat - start.lat) / stepCount; // Latitude step increment
    let deltaLng = (end.lng - start.lng) / stepCount; // Longitude step increment

    let interval = setInterval(() => {
      step++;

      // Calculate the next position of the vehicle
      const nextLat = start.lat + deltaLat * step;
      const nextLng = start.lng + deltaLng * step;
      const nextPosition = { lat: nextLat, lng: nextLng };

      // Move the vehicle marker to the new position
      vehicleMarker.setPosition(nextPosition);
      map.panTo(nextPosition);

      // Update vehicle path for a trailing effect
      vehiclePath.push(nextPosition);
      new google.maps.Polyline({
        path: vehiclePath,
        geodesic: true,
        strokeColor: "#0000FF", // Trailing path color
        strokeOpacity: 0.6,
        strokeWeight: 2,
        map: map,
      });

      // If reached the end of the current segment, prepare for the next
      if (step === stepCount) {
        clearInterval(interval);
        currentIndex++;
        setTimeout(() => {
          animateVehicle(); // Move to the next point after the stop delay
        }, stopDelay);
      }
    }, animationSpeed);
  }
}