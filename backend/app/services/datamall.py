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
        print("Status Code:", response.status_code)
        print("Response snippet:", response.text[:200], "...")

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
        
def get_bus_arrivals(busStopCode:int):
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []
    
    if not busStopCode: raise ValueError("busStopCode is required")

    url = "https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }
    params = {"BusStopCode": busStopCode}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        bus_arrivals = data.get("value", [])
        if not bus_arrivals: print("No bus arrivals returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(bus_arrivals)} bus stops successfully.")
        return bus_arrivals

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_bus_services():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/BusServices"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        bus_services = data.get("value", [])
        if not bus_services: print("No bus services returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(bus_services)} bus stops successfully.")
        return bus_services

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_bus_routes():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/BusRoutes"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        bus_routes = data.get("value", [])
        if not bus_routes: print("No bus routes returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(bus_routes)} bus stops successfully.")
        return bus_routes

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_station_crowd_density_realtime(train_line:str):
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []
    
    if not train_line: raise ValueError("train_line is required")

    url = "https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }
    params = {"TrainLine": train_line}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        station_crowd_density = data.get("value", [])
        if not station_crowd_density: print("No data returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(station_crowd_density)} bus stops successfully.")
        return station_crowd_density

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_station_crowd_density_forecast(train_line:str):
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []
    
    if not train_line: raise ValueError("train_line is required")

    url = "https://datamall2.mytransport.sg/ltaodataservice/PCDForecast"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }
    params = {"TrainLine": train_line}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        station_crowd_density_forecast = data.get("value", [])
        if not station_crowd_density_forecast: print("No data returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(station_crowd_density_forecast)} bus stops successfully.")
        return station_crowd_density_forecast

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_taxi_availability():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        taxi_availability = data.get("value", [])
        if not taxi_availability: print("No taxies returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(taxi_availability)} bus stops successfully.")
        return taxi_availability

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_taxi_stands():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/TaxiStands"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        taxi_stands = data.get("value", [])
        if not taxi_stands: print("No taxi stands returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(taxi_stands)} bus stops successfully.")
        return taxi_stands

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_train_service_alerts():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        train_service_alerts = data.get("value", [])
        if not train_service_alerts: print("No alerts returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(train_service_alerts)} bus stops successfully.")
        return train_service_alerts

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_estimated_travel_times():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/EstTravelTimes"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        travel_times = data.get("value", [])
        if not travel_times: print("No travel times returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(travel_times)} bus stops successfully.")
        return travel_times

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_traffic_images():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        traffic_images = data.get("value", [])
        if not traffic_images: print("No traffic images returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(traffic_images)} bus stops successfully.")
        return traffic_images

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []
    
def get_traffic_incidents():
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []

    url = "https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        traffic_incidents = data.get("value", [])
        if not traffic_incidents: print("No traffic incidents returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(traffic_incidents)} bus stops successfully.")
        return traffic_incidents

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []

def get_geospacial_whole_island(id:int):
    if not DATAMALL_API_KEY:
        print("API key not found. Please set it in your .env file.")
        return []
    
    if not id: raise ValueError("id is required")

    url = "https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland"
    headers = {
        "AccountKey": DATAMALL_API_KEY,
        "accept": "application/json"
    }
    params = {"ID": id}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        bus_arrivals = data.get("value", [])
        if not bus_arrivals: print("No geospatial data returned. Your API key may not be subscribed to the dataset.")
        else: print(f"Retrieved {len(bus_arrivals)} returned successfully.")
        return bus_arrivals

    except requests.exceptions.RequestException as e:
        print("LTA API request failed:", e)
        return []

# Example usage
if __name__ == "__main__":
    stops = get_bus_stops()
    print(f"\nTotal bus stops retrieved: {len(stops)}")
