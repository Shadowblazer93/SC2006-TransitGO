import requests
import os

DATAMALL_API_KEY = os.getenv("DATAMALL_API_KEY")
# I have pinned the API key in Telegram.
# Add an environment variable "DATAMALL_API_KEY" with value of the API key to your device.
# DO NOT PASTE THE API KEY HERE.

def get_bus_stops():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set the environment variable 'DATAMALL_API_KEY'.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/BusStops"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Debug info: status code and raw text
        print("Status Code:", response.status_code)
        print("Response snippet:", response.text[:200], "...")  # first 200 chars

        data = response.json()
        
        # Check if 'value' exists and has items
        bus_stops = data.get("value", [])
        if not bus_stops:
            print("No bus stops returned. This usually means your API key is not subscribed to the BusStops dataset.")
        
        return bus_stops

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []

# Example usage
if __name__ == "__main__":
    stops = get_bus_stops()
    print(f"Number of bus stops retrieved: {len(stops)}")
