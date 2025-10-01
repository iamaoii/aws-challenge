from supabase import create_client, Client
from app.core.config import settings

class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        self.service_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

    async def get_user_profile(self, user_id: str):
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None

    async def get_events(self):
        response = self.client.table("events").select("*").execute()
        return response.data

    async def get_event(self, event_id: str):
        response = self.client.table("events").select("*").eq("id", event_id).execute()
        return response.data[0] if response.data else None

    async def get_user_events(self, user_id: str):
        created = self.client.table("events").select("*").eq("creator_id", user_id).execute().data
        registered = self.client.table("registrations").select("events.*").eq("user_id", user_id).execute().data
        return {"created": created, "registered": registered}

    async def update_attendees_count(self, event_id: str):
        self.client.rpc("update_attendees_count", {"event_id": event_id}).execute()

supabase = SupabaseClient()