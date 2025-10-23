from dotenv import load_dotenv
load_dotenv() 

import requests
import os

DATAMALL_API_KEY = os.getenv("DATAMALL_API_KEY")

def get_bus_stops():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/BusStops"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Debug info: status code and partial response
        print("✅ Status Code:", response.status_code)
        print("📦 Response snippet:", response.text[:200], "...")

        data = response.json()
        bus_stops = data.get("value", [])

        if not bus_stops:
            print("No bus stops returned. Your API key may not be subscribed to the BusStops dataset.")
        else:
            print(f"Retrieved {len(bus_stops)} bus stops successfully.")

        return bus_stops

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []

# Example usage
if __name__ == "__main__":
    stops = get_bus_stops()
    print(f"\nTotal bus stops retrieved: {len(stops)}")
