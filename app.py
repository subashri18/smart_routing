from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

TOMTOM_API_KEY = "YOUR_TOMTOM_API_KEY"

def geocode_location(location):
    url = f"https://api.tomtom.com/search/2/geocode/{location}.json?key={TOMTOM_API_KEY}"
    res = requests.get(url)
    if res.status_code == 200:
        data = res.json()
        if data['results']:
            lat = data['results'][0]['position']['lat']
            lon = data['results'][0]['position']['lon']
            return lat, lon
    return None, None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/route', methods=['POST'])
def get_route():
    start = request.form['start']
    end = request.form['end']

    start_lat, start_lon = geocode_location(start)
    end_lat, end_lon = geocode_location(end)

    if None in (start_lat, start_lon, end_lat, end_lon):
        return jsonify({'error': 'Geocoding failed. Check location names.'})

    route_url = (
        f"https://api.tomtom.com/routing/1/calculateRoute/"
        f"{start_lat},{start_lon}:{end_lat},{end_lon}/json"
        f"?key={TOMTOM_API_KEY}&routeType=fastest&traffic=true&computeBestOrder=false&alternatives=2"
    )

    response = requests.get(route_url)

    if response.status_code != 200:
        return jsonify({'error': f"Route fetch failed: {response.status_code}"})

    data = response.json()
    routes_info = []

    for route in data.get('routes', []):
        summary = route['summary']
        legs = route['legs'][0]['points']
        points = [{'lat': pt['latitude'], 'lon': pt['longitude']} for pt in legs]

        routes_info.append({
            'summary': {
                'lengthInMeters': summary['lengthInMeters'],
                'travelTimeInSeconds': summary['travelTimeInSeconds'],
                'trafficDelayInSeconds': summary['trafficDelayInSeconds']
            },
            'points': points
        })

    return jsonify({'routes': routes_info})

if __name__ == '__main__':
    app.run(debug=True)




