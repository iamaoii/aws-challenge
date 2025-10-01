from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db.supabase import supabase
from app.core.security import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/events", tags=["events"])

class EventCreate(BaseModel):
    title: str
    description: str | None = None
    date: str
    time: str
    location: str
    category: str | None = None
    max_attendees: int | None = None
    requirements: str | None = None
    contact_info: str | None = None
    image_url: str | None = None

@router.get("/")
async def get_events(current_user: dict = Depends(get_current_user)):
    events = await supabase.get_events()
    return events

@router.post("/")
async def create_event(event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    try:
        event = event_data.model_dump()
        event["id"] = str(uuid.uuid4())
        event["creator_id"] = current_user["user_id"]
        event["status"] = "upcoming" if datetime.fromisoformat(event_data.date) > datetime.now() else "ongoing"
        response = supabase.client.table("events").insert(event).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{event_id}")
async def get_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await supabase.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}")
async def update_event(event_id: str, event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    try:
        event = await supabase.get_event(event_id)
        if not event or event["creator_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        update_data = event_data.model_dump()
        update_data["status"] = "upcoming" if datetime.fromisoformat(event_data.date) > datetime.now() else "ongoing"
        response = supabase.client.table("events").update(update_data).eq("id", event_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{event_id}/register")
async def register_event(event_id: str, current_user: dict = Depends(get_current_user)):
    try:
        event = await supabase.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event["max_attendees"] and event["attendees_count"] >= event["max_attendees"]:
            raise HTTPException(status_code=400, detail="Event is full")
        registration = {"id": str(uuid.uuid4()), "user_id": current_user["user_id"], "event_id": event_id}
        supabase.client.table("registrations").insert(registration).execute()
        await supabase.update_attendees_count(event_id)
        return {"message": "Registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{event_id}/register")
async def unregister_event(event_id: str, current_user: dict = Depends(get_current_user)):
    try:
        supabase.client.table("registrations").delete().eq("user_id", current_user["user_id"]).eq("event_id", event_id).execute()
        await supabase.update_attendees_count(event_id)
        return {"message": "Unregistered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{user_id}/events")
async def get_user_events(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return await supabase.get_user_events(user_id)