# Smart Routing Application

A Flask-based web application that provides intelligent route planning using TomTom's routing API with real-time traffic data.

## Features

- 🗺️ Interactive map interface using Leaflet
- 🚗 Multiple route types (fastest, shortest, eco-friendly)
- 🚦 Real-time traffic integration
- 📱 Responsive design for mobile and desktop
- 🎯 Location autocomplete suggestions
- 📊 Detailed route information with statistics

## Prerequisites

- Python 3.7 or higher
- TomTom API key (get one from [TomTom Developer Portal](https://developer.tomtom.com/))

## Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Update the `.env` file with your TomTom API key:
   ```
   TOMTOM_API_KEY=your_actual_api_key_here
   ```

## Running the Application

1. **Start the Flask server**
   ```bash
   python app.py
   ```

2. **Open your browser**
   Navigate to `http://localhost:5000`

3. **Test the application**
   ```bash
   python test_app.py
   ```

## Project Structure

```
smart_routing/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── test_app.py           # Test script
├── templates/
│   └── index.html        # Main web interface
└── static/
    └── map.js            # Frontend JavaScript logic
```

## API Endpoints

### GET /
- Returns the main web interface

### POST /calculate_route
- Calculates optimal route between two locations
- **Request Body:**
  ```json
  {
    "start": "Starting location",
    "end": "Destination location",
    "routeType": "fastest|shortest|eco",
    "traffic": "true|false"
  }
  ```
- **Response:** TomTom routing API response with route details

## Usage

1. **Enter Locations**
   - Type your starting point in the "Starting Point" field
   - Type your destination in the "Destination" field
   - Use the autocomplete suggestions for common Indian cities

2. **Configure Route Options**
   - Select route type: Fastest, Shortest, or Eco-Friendly
   - Choose whether to include real-time traffic data

3. **Calculate Route**
   - Click "Calculate Route" to find the optimal path
   - View the route on the interactive map
   - Check detailed statistics including distance, duration, and traffic delays

## Features Explained

### Route Types
- **Fastest**: Minimizes travel time
- **Shortest**: Minimizes distance
- **Eco-Friendly**: Optimizes for fuel efficiency

### Map Features
- Interactive zoom and pan
- Route visualization with different colors
- Start and end point markers
- Responsive design for all screen sizes

### Route Information
- Total distance in kilometers
- Estimated travel time
- Traffic delay information
- Estimated arrival time

## Troubleshooting

### Common Issues

1. **"Could not geocode location" error**
   - Make sure location names are specific (include city, state/country)
   - Try using landmark names or complete addresses

2. **Map not loading**
   - Check your TomTom API key in the `.env` file
   - Ensure you have an active internet connection

3. **No route found**
   - Verify that both locations are accessible by car
   - Try using more specific location names

### API Key Issues
- Ensure your TomTom API key is valid and has sufficient quota
- Check the TomTom Developer Console for usage limits

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Support

For issues related to:
- **TomTom API**: Visit [TomTom Developer Portal](https://developer.tomtom.com/)
- **Flask**: Check [Flask Documentation](https://flask.palletsprojects.com/)
- **Leaflet**: See [Leaflet Documentation](https://leafletjs.com/)

---

Made with ❤️ for smart routing solutions
