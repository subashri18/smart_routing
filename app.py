from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

TOMTOM_API_KEY = os.getenv('TOMTOM_API_KEY', '8apa9iB3Hpwhh1LWONc8ZJ1TbGttgVDK')

@app.route('/')
def index():
    return render_template('index.html', api_key=TOMTOM_API_KEY)

@app.route('/calculate_route', methods=['POST'])
def calculate_route():
    data = request.json
    
    # Extract parameters from the request
    start = data.get('start')
    end = data.get('end')
    route_type = data.get('routeType', 'fastest')
    traffic = data.get('traffic', 'true')

    def geocode_location(location):
        geocode_url = f"https://api.tomtom.com/search/2/geocode/{location}.json"
        geocode_params = {
            'key': TOMTOM_API_KEY,
            'limit': 1
        }
        try:
            resp = requests.get(geocode_url, params=geocode_params)
            resp.raise_for_status()
            results = resp.json().get('results', [])
            if results:
                position = results[0]['position']
                return f"{position['lat']},{position['lon']}"
            else:
                return None
        except Exception as e:
            return None

    # Convert start and end to coordinates if needed
    start_coords = geocode_location(start)
    end_coords = geocode_location(end)
    if not start_coords or not end_coords:
        return jsonify({'error': 'Could not geocode start or end location.'}), 400

    # TomTom Routing API endpoint
    url = f"https://api.tomtom.com/routing/1/calculateRoute/{start_coords}:{end_coords}/json"

    params = {
        'key': TOMTOM_API_KEY,
        'routeType': route_type,
        'traffic': traffic,
        'travelMode': 'car',
        'language': 'en-US',
        'instructionsType': 'text',
        'computeBestOrder': 'false',
        'vehicleMaxSpeed': 120,
        'vehicleWeight': 1600,
        'vehicleLength': 4.5,
        'vehicleWidth': 1.8,
        'vehicleHeight': 1.6,
        'vehicleCommercial': 'false'
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)