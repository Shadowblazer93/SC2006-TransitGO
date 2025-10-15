from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.datamall import *

router = APIRouter()

@router.get("/busstops")
def bus_stops():
    try:
        data = get_bus_stops()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Logic to create a new user
    pass

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int):
    # Logic to read a user by ID
    pass

@router.get("/users/", response_model=list[UserResponse])
async def read_users():
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