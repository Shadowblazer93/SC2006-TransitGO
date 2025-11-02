from fastapi import APIRouter, HTTPException,Depends,Header 
from uuid import UUID
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse,ReplyIn
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
def bus_arrivals(busStopCode:str):
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
    
@router.get("/geospatialwholeisland/{id}")
def station_crowddensityforecast(id:str):
    try:
        data = get_geospacial_whole_island(id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Logic to create a new user
    pass

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: UUID):
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
async def update_user(user_id: UUID, user: UserCreate):
    # Logic to update a user by ID
    pass

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    # Logic to delete a user by ID
    pass

@router.get("/feedbacks/")
async def read_feedbacks():
    resp = list_feedbacks()
    return resp

@router.delete("/feedbacks/{feedback_id}")
async def delete_feedback_entry(feedback_id: int):
    resp = delete_feedback(feedback_id)
    return {"message": "Feedback deleted successfully", "data": resp.data}


@router.get("/feedbacks/{feedback_id}/replies")
async def read_feedback_resplies(feedback_id: int):
    resp = list_replies(feedback_id)
    return resp

@router.delete("/feedbacks/{feedback_id}/replies/{reply_id}")
async def delete_feedback_reply(feedback_id: int, reply_id: int):
    resp = delete_reply(reply_id)
    return {"message": "Reply deleted successfully", "data": resp.data}


@router.post("/feedbacks/{fid}/replies", status_code=201)
def create_reply(fid: int, body: ReplyIn, user_uuid: UUID = Depends(get_current_user_uuid)):
    msg = (body.content or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Reply content cannot be empty")

    ins = {"feedback_id": fid, "user_id": str(user_uuid), "content": msg}
    print("DEBUG insert payload:", ins)  # TEMP

    try:
        resp = supabase.table("replies").insert(ins).execute()
        print("DEBUG insert resp:", resp.data)  # TEMP
    except Exception as e:
        # This will show the exact FK/constraint error from PostgREST/Postgres
        print("DEBUG insert error:", repr(e))
        raise HTTPException(status_code=500, detail="Insert failed")

    row = (resp.data or [None])[0]
    if not row:
        raise HTTPException(status_code=500, detail="Insert returned no row")

    return {
        "id": row["id"],
        "content": row["content"],
        "created_at": row["created_at"],
        "user_id": row["user_id"],
    }
@router.delete("/UserProfile")
def delete_user_account(uid: UUID = Depends(get_current_user_uuid)):
    resp = delete_account(uid)
    return {"message": "Account deleted successfully"}

    