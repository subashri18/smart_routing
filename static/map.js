let map;
let routeLayers = [];

function initMap() {
  map = L.map("map").setView([13.0827, 80.2707], 7); // Default view (Chennai)

  L.tileLayer(
    "https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=YOUR_TOMTOM_API_KEY",
    {
      attribution: "© TomTom",
      maxZoom: 18,
    }
  ).addTo(map);
}

document.getElementById("routeForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  const response = await fetch("/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  });

  const data = await response.json();

  if (data.error) {
    alert("Error: " + data.error);
    return;
  }

  // Clear old routes from map
  routeLayers.forEach((layer) => map.removeLayer(layer));
  routeLayers = [];

  let shortestDuration = Infinity;
  let shortestRouteIndex = -1;

  data.routes.forEach((route, index) => {
    const coords = route.points.map((pt) => [pt.lat, pt.lon]);

    const color = index === 0 ? "blue" : "green"; // default
    const polyline = L.polyline(coords, {
      color: color,
      weight: 5,
      opacity: 0.7,
    }).addTo(map);

    routeLayers.push(polyline);

    if (route.summary.durationInSeconds < shortestDuration) {
      shortestDuration = route.summary.durationInSeconds;
      shortestRouteIndex = index;
    }
  });

  // Highlight shortest route in RED
  if (shortestRouteIndex !== -1) {
    const shortestCoords = data.routes[shortestRouteIndex].points.map((pt) => [pt.lat, pt.lon]);
    const redLine = L.polyline(shortestCoords, {
      color: "red",
      weight: 6,
      opacity: 1,
    }).addTo(map);
    routeLayers.push(redLine);
  }

  map.fitBounds(routeLayers[0].getBounds());

  // Show summary
  const infoDiv = document.getElementById("routeInfo");
  infoDiv.innerHTML = "";
  data.routes.forEach((route, index) => {
    const distance = (route.summary.lengthInMeters / 1000).toFixed(2);
    const duration = (route.summary.travelTimeInSeconds / 60).toFixed(1);
    const trafficDelay = (route.summary.trafficDelayInSeconds / 60).toFixed(1);

    infoDiv.innerHTML += `
      <div style="margin-bottom:10px;">
        <strong>Route ${index + 1}</strong><br>
        Distance: ${distance} km<br>
        Duration: ${duration} min<br>
        Traffic Delay: ${trafficDelay} min
      </div>
    `;
  });
});
