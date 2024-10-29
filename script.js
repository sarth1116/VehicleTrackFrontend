let map;
let vehicleMarker;
let path = [];
let index = 0;
let traveledPath; // Polyline to show the path traveled
let interval;

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

        moveVehicleSmoothly(path[index], path[index + 1]);

        // Add numbered markers only if new position
        new google.maps.Marker({
            position: path[index],
            map: map,
            label: {
                text: `${index + 1}`,
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
            },
            icon: {
                url: "https://img.icons8.com/emoji/48/000000/red-circle-emoji.png",
                scaledSize: new google.maps.Size(15, 15)
            },
            title: `Stop ${index + 1}`
        });

        index++;
    }, 4000);
}

function moveVehicleSmoothly(start, end) {
    const steps = 200;  // More steps for smoother transition
    const latStep = (end.lat() - start.lat()) / steps;
    const lngStep = (end.lng() - start.lng()) / steps;

    let stepCount = 0;
    const smoothInterval = setInterval(() => {
        if (stepCount >= steps) {
            clearInterval(smoothInterval);
            vehicleMarker.setPosition(end);
            return;
        }

        const newLat = start.lat() + latStep * stepCount;
        const newLng = start.lng() + lngStep * stepCount;
        const newPos = { lat: newLat, lng: newLng };

        vehicleMarker.setPosition(newPos);
        traveledPath.getPath().push(newPos);

        stepCount++;
    }, 40);
}

window.initMap = initMap;
