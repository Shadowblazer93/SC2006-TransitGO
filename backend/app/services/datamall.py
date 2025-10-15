import requests
import os

DATAMALL_API_KEY = os.getenv("DATAMALL_API_KEY")
# I have pinned the API key in the telegram.
# Add an environment variable "DATAMALL_API_KEY" with value of the API key to your device.
# DO NOT PASTE THE API KEY HERE.

def get_bus_stops():
    url = "https://datamall2.mytransport.sg/ltaodataservice/BusStops"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()