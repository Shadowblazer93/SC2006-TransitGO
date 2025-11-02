import os,jwt
from dotenv import load_dotenv
from supabase import create_client, Client
from uuid import UUID
from fastapi import Header, HTTPException

# Supabase API Key and URL will be in the telegram.
# Add environment variable "SUPABASE_URL" and "SUPBASE_KEY" with value of the API key to your device.
# DO NOT PASTE THE API KEY HERE.

load_dotenv()
url=os.getenv("SUPABASE_URL")
key=os.getenv("SUPABASE_KEY")
supabase: Client=create_client(url,key)

sb: Client = create_client(url,key)


def get_current_user_uuid(authorization: str = Header(...)) -> UUID:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        resp = sb.auth.get_user(token)  # Supabase verifies and returns the user
        uid = resp.user.id
        return UUID(uid)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
def get_specific_user(user_id:UUID ):
    resp = supabase.table("users").select("*").eq("uid",user_id).single().execute()
    print(resp.data)
    return resp

def list_feedbacks():
    try:
        sel = "id,created_at,title,description,type,rating,user:users(username)"
        #            ^ alias     ^ inferred relation to users via feedback.user_id
        resp = supabase.table("feedback").select(sel).order("created_at", desc=True).execute()
        rows = resp.data or []
        for r in rows:
            r["username"] = (r.get("user") or {}).get("username")
            r.pop("user", None)
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

def list_replies(feedback_id: int):
    """
    Return replies for a feedback with author username and timestamp.
    Shape: [{id, content, created_at, author}]
    """
    # Let PostgREST infer the FK replies.user_id -> users.id
    sel = "id, content, created_at, user_id, user:users!replies_user_id_fkey(username)"
    resp = supabase.table("replies") \
        .select(sel) \
        .eq("feedback_id", feedback_id) \
        .order("created_at", desc=False) \
        .execute()
    
    print(resp.data)

    rows = resp.data or []
    # Flatten: user.username -> author
    for r in rows:
        r["author"] = (r.get("user") or {}).get("username") or "Unknown"
        r.pop("user", None)
        print(r)
    return rows

def delete_reply(reply_id: int):
    try:
        resp = supabase.table("replies").delete().eq("id", reply_id).execute()
    except Exception as e:
        print("Error deleting reply:", str(e))
        raise e
    return resp