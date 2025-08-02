#!/usr/bin/env python3
"""
Smart Routing App Test Script
This script helps test the Flask application and its endpoints.
"""

import requests
import json
import time

def test_app_health():
    """Test if the Flask app is running"""
    try:
        response = requests.get('http://localhost:5000', timeout=5)
        if response.status_code == 200:
            print("✅ App is running successfully!")
            return True
        else:
            print(f"❌ App returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ App is not running. Please start the Flask app first.")
        return False
    except Exception as e:
        print(f"❌ Error testing app: {e}")
        return False

def test_route_calculation():
    """Test the route calculation endpoint"""
    test_data = {
        "start": "Delhi, India",
        "end": "Mumbai, India",
        "routeType": "fastest",
        "traffic": "true"
    }
    
    try:
        print("🔍 Testing route calculation...")
        response = requests.post(
            'http://localhost:5000/calculate_route',
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'routes' in data and len(data['routes']) > 0:
                route = data['routes'][0]
                summary = route['summary']
                distance = summary['lengthInMeters'] / 1000
                duration = summary['travelTimeInSeconds'] / 60
                
                print("✅ Route calculation successful!")
                print(f"   Distance: {distance:.1f} km")
                print(f"   Duration: {duration:.1f} minutes")
                return True
            else:
                print("❌ No routes found in response")
                return False
        else:
            print(f"❌ Route calculation failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing route calculation: {e}")
        return False

def main():
    print("🚀 Smart Routing App Test Suite")
    print("=" * 40)
    
    # Test 1: App Health
    print("\n1. Testing app health...")
    if not test_app_health():
        print("\n💡 To start the app, run: python app.py")
        return
    
    # Test 2: Route Calculation
    print("\n2. Testing route calculation...")
    test_route_calculation()
    
    print("\n" + "=" * 40)
    print("🎉 Test suite completed!")
    print("\n💡 Open http://localhost:5000 in your browser to use the app")

if __name__ == "__main__":
    main()
