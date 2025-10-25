from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.datamall import *
from app.services.dbconfig import *

router = APIRouter()

@router.get("/busstops")
def bus_stops():
    try:
        data = get_bus_stops()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/busarrivals/{busStopCode}")
def bus_arrivals(busStopCode:int):
    try:
        data = get_bus_arrivals(busStopCode)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/busservices")
def bus_services():
    try:
        data = get_bus_services()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/busroutes")
def bus_routes():
    try:
        data = get_bus_routes()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/stationcrowddensityrealtime/{train_line}")
def station_crowddensityrealtime(train_line:str):
    try:
        data = get_station_crowd_density_realtime(train_line)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/stationcrowddensityforecast/{train_line}")
def station_crowddensityforecast(train_line:str):
    try:
        data = get_station_crowd_density_forecast(train_line)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/taxiavailability")
def taxi_availability():
    try:
        data = get_taxi_availability()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/taxistands")
def taxi_stands():
    try:
        data = get_taxi_stands()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trainservicealerts")
def train_service_alerts():
    try:
        data = get_train_service_alerts()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/estimatedtraveltimes")
def estimatedtraveltimes():
    try:
        data = get_estimated_travel_times()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/trafficimages")
def traffic_images():
    try:
        data = get_traffic_images()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/trafficincidents")
def traffic_incidents():
    try:
        data = get_traffic_incidents()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Logic to create a new user
    pass

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int):
    #basic checking to see if db can be accessed
    resp = get_specific_user(user_id)
    return resp.data
    # Logic to read a user by ID
    pass

@router.get("/users/", response_model=list[UserResponse])
async def read_users():
    #basic checking to see if db can be accessed
    resp=supabase.table("users").select("*").execute()
    return resp.data
    # Logic to read all users
    pass

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserCreate):
    # Logic to update a user by ID
    pass

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    # Logic to delete a user by ID
    pass