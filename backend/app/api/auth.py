from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.supabase import supabase
from jose import jwt
from app.core.config import settings
import bcrypt
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

@router.post("/signup")
async def signup(request: SignupRequest):
    try:
        # Hash password
        password_hash = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data = {
            "id": str(uuid.uuid4()),
            "full_name": request.full_name,
            "email": request.email,
            "password_hash": password_hash
        }
        response = supabase.service_client.table("users").insert(user_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Generate JWT
        token = jwt.encode(
            {"sub": response.data[0]["id"], "email": request.email, "name": request.full_name},
            settings.JWT_SECRET,
            algorithm="HS256"
        )
        return {"access_token": token, "user": {"id": response.data[0]["id"], "email": request.email, "name": request.full_name}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))