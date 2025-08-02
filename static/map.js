let map;
let routeLayers = [];
let startMarker = null;
let endMarker = null;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

function initMap() {
    // Initialize map centered on India
    map = L.map("map").setView([20.5937, 78.9629], 5);

    // Add TomTom tile layer with API key
    L.tileLayer(
        `https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${window.TOMTOM_API_KEY}`,
        {
            attribution: "© TomTom",
            maxZoom: 18,
            subdomains: ['a', 'b', 'c', 'd']
        }
    ).addTo(map);
}

function showLoading() {
    const routeInfo = document.getElementById("routeInfo");
    const routeDetails = document.getElementById("routeDetails");
    
    routeInfo.style.display = "block";
    routeDetails.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Calculating optimal routes...</p>
        </div>
    `;
}

function showError(message) {
    const routeInfo = document.getElementById("routeInfo");
    const routeDetails = document.getElementById("routeDetails");
    
    routeInfo.style.display = "block";
    routeDetails.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Error:</strong> ${message}
        </div>
    `;
}

function clearMap() {
    // Remove existing route layers
    routeLayers.forEach(layer => map.removeLayer(layer));
    routeLayers = [];
    
    // Remove existing markers
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
}

function addMarkers(startCoords, endCoords) {
    // Add start marker (green)
    startMarker = L.marker([startCoords.lat, startCoords.lon], {
        icon: L.divIcon({
            className: 'custom-marker start-marker',
            html: '<i class="fas fa-map-marker-alt" style="color: #4CAF50; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    }).addTo(map);
    
    // Add end marker (red)
    endMarker = L.marker([endCoords.lat, endCoords.lon], {
        icon: L.divIcon({
            className: 'custom-marker end-marker',
            html: '<i class="fas fa-flag-checkered" style="color: #f44336; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    }).addTo(map);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function formatDistance(meters) {
    const km = meters / 1000;
    if (km >= 1) {
        return `${km.toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
}

function displayRouteInfo(routeData) {
    const routeInfo = document.getElementById("routeInfo");
    const routeDetails = document.getElementById("routeDetails");
    
    if (!routeData.routes || routeData.routes.length === 0) {
        showError("No routes found for the given locations.");
        return;
    }

    const route = routeData.routes[0]; // TomTom typically returns one optimized route
    const summary = route.summary;
    
    // Extract coordinates for the route
    const legs = route.legs || [];
    const allPoints = [];
    
    legs.forEach(leg => {
        if (leg.points) {
            leg.points.forEach(point => {
                allPoints.push([point.latitude, point.longitude]);
            });
        }
    });
    
    // If no points in legs, try to get from guidance
    if (allPoints.length === 0 && route.guidance && route.guidance.instructions) {
        route.guidance.instructions.forEach(instruction => {
            if (instruction.point) {
                allPoints.push([instruction.point.latitude, instruction.point.longitude]);
            }
        });
    }
    
    // Draw the route on map
    if (allPoints.length > 0) {
        const polyline = L.polyline(allPoints, {
            color: '#2196F3',
            weight: 5,
            opacity: 0.8
        }).addTo(map);
        
        routeLayers.push(polyline);
        
        // Fit map to route bounds
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }
    
    // Display route information
    const distance = formatDistance(summary.lengthInMeters);
    const duration = formatTime(summary.travelTimeInSeconds);
    const trafficDelay = summary.trafficDelayInSeconds ? formatTime(summary.trafficDelayInSeconds) : "0m";
    const arrivalTime = new Date(Date.now() + (summary.travelTimeInSeconds * 1000));
    
    routeInfo.style.display = "block";
    routeDetails.innerHTML = `
        <div class="route-card">
            <h4><i class="fas fa-route"></i> Recommended Route</h4>
            <div class="route-stats">
                <div class="stat">
                    <i class="fas fa-road"></i>
                    <span><strong>Distance:</strong> ${distance}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-clock"></i>
                    <span><strong>Duration:</strong> ${duration}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-traffic-light"></i>
                    <span><strong>Traffic Delay:</strong> ${trafficDelay}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-calendar-check"></i>
                    <span><strong>Arrival:</strong> ${arrivalTime.toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    `;
}

// Handle form submission
document.getElementById("routeForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const start = document.getElementById("start").value.trim();
    const end = document.getElementById("end").value.trim();
    const routeType = document.getElementById("routeType").value;
    const traffic = document.getElementById("traffic").value;
    const calculateBtn = document.getElementById("calculateBtn");

    if (!start || !end) {
        showError("Please enter both starting point and destination.");
        return;
    }

    // Show loading state
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    showLoading();
    clearMap();

    try {
        // Make request to Flask backend
        const response = await fetch("/calculate_route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                start: start,
                end: end,
                routeType: routeType,
                traffic: traffic
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to calculate route");
        }

        // Display the route
        displayRouteInfo(data);

        // Extract start and end coordinates from the response for markers
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            if (route.summary && route.summary.startLocation && route.summary.endLocation) {
                addMarkers(
                    route.summary.startLocation,
                    route.summary.endLocation
                );
            }
        }

    } catch (error) {
        console.error("Error calculating route:", error);
        showError(error.message || "An error occurred while calculating the route. Please try again.");
    } finally {
        // Reset button state
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = '<i class="fas fa-search"></i> Calculate Route';
    }
});

// Add some sample location suggestions
const locationSuggestions = [
    "Delhi, India",
    "Mumbai, India", 
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Pune, India",
    "Ahmedabad, India"
];

// Simple autocomplete functionality
function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        // Remove any existing suggestions
        const existingSuggestions = document.querySelector('.suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        
        if (value.length > 2) {
            const matches = locationSuggestions.filter(location => 
                location.toLowerCase().includes(value)
            );
            
            if (matches.length > 0) {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'suggestions';
                suggestionDiv.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                `;
                
                matches.forEach(match => {
                    const item = document.createElement('div');
                    item.textContent = match;
                    item.style.cssText = `
                        padding: 10px 15px;
                        cursor: pointer;
                        border-bottom: 1px solid #f0f0f0;
                    `;
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#f8f9fa';
                    });
                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = 'white';
                    });
                    item.addEventListener('click', () => {
                        input.value = match;
                        suggestionDiv.remove();
                    });
                    suggestionDiv.appendChild(item);
                });
                
                input.parentElement.style.position = 'relative';
                input.parentElement.appendChild(suggestionDiv);
            }
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.parentElement.contains(e.target)) {
            const suggestions = document.querySelector('.suggestions');
            if (suggestions) {
                suggestions.remove();
            }
        }
    });
}

// Setup autocomplete for both inputs
setupAutocomplete('start');
setupAutocomplete('end');
