from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

TOMTOM_API_KEY = os.getenv('TOMTOM_API_KEY', '8apa9iB3Hpwhh1LWONc8ZJ1TbGttgVDK')
OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY', 'YOUR_OPENWEATHER_API_KEY_HERE')

@app.route('/')
def index():
    return render_template('index.html', api_key=TOMTOM_API_KEY)

@app.route('/calculate_route', methods=['POST'])
def calculate_route():
    data = request.json
    
    start = data.get('start')
    end = data.get('end')
    route_type = data.get('routeType', 'fastest')
    traffic = data.get('traffic', 'true')
    weather_flag = data.get('weather', 'false')  # get weather option

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
                pos = results[0]['position']
                return pos['lat'], pos['lon']
            return None
        except:
            return None

    start_coords = geocode_location(start)
    end_coords = geocode_location(end)
    if not start_coords or not end_coords:
        return jsonify({'error': 'Could not geocode start or end location.'}), 400

    url = f"https://api.tomtom.com/routing/1/calculateRoute/{start_coords[0]},{start_coords[1]}:{end_coords[0]},{end_coords[1]}/json"
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
        route_data = response.json()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    weather_data = {}
    if weather_flag == "true":
        def get_weather(lat, lon):
            weather_url = "https://api.openweathermap.org/data/2.5/weather"
            weather_params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHERMAP_API_KEY,
                'units': 'metric'
            }
            try:
                r = requests.get(weather_url, params=weather_params)
                r.raise_for_status()
                w = r.json()
                return {
                    'location': w.get('name', ''),
                    'temp': w['main']['temp'],
                    'description': w['weather'][0]['description'],
                    'icon': w['weather'][0]['icon']
                }
            except:
                return {'error': 'Weather fetch failed'}

        weather_data['start'] = get_weather(*start_coords)
        weather_data['end'] = get_weather(*end_coords)

    return jsonify({
        'routes': route_data.get('routes', []),  # maintain your original key name here
        'weather': weather_data if weather_flag == "true" else None
    })

if __name__ == '__main__':
    app.run(debug=True)

