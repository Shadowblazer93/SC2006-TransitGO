import os
from dotenv import load_dotenv
from supabase import create_client, Client
from uuid import UUID

# Supabase API Key and URL will be in the telegram.
# Add environment variable "SUPABASE_URL" and "SUPBASE_KEY" with value of the API key to your device.
# DO NOT PASTE THE API KEY HERE.

load_dotenv()
url=os.getenv("SUPABASE_URL")
key=os.getenv("SUPABASE_KEY")
supabase: Client=create_client(url,key)

def get_specific_user(user_id:UUID ):
    resp = supabase.table("users").select("*").eq("uid",user_id).single().execute()
    print(resp.data)
    return resp

def list_feedbacks():
    # Embed the related users row (only username)
    # If FK name is feedback_user_id_fkey, use the !<fk_name> form.
    try:
    
        sel = """
        id, created_at, title, description, type, rating,
        users:users!feedback_user_id_fkey ( username )
        """
        resp = supabase.table("feedback").select(sel).order("created_at", desc=True).execute()
        rows = resp.data or []

        # Flatten: users.username  -> username
        for r in rows:
            r["username"] = (r.get("users") or {}).get("username")
            r.pop("users", None)
        return rows
    except Exception as e:
        print("Error listing feedbacks:", str(e))
        raise e

def delete_feedback(feedback_id: int):
    try:
        resp = supabase.table("feedback").delete().eq("id", feedback_id).execute()
    except Exception as e:
        print("Error deleting feedback:", str(e))
        raise e
    return resp

def list_reply_for_feedback(feedback_id: int):
    try:
        resp = supabase.table("replies").select("*").eq("feedback_id", feedback_id).execute()
        print(resp.data)
    except Exception as e:
        print("Error listing feedback responses:", str(e))
        raise e
    return resp.data