import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Supabase API Key and URL will be in the telegram.
# Add environment variable "SUPABASE_URL" and "SUPBASE_KEY" with value of the API key to your device.
# DO NOT PASTE THE API KEY HERE.

load_dotenv()
url=os.getenv("SUPABASE_URL")
key=os.getenv("SUPABASE_KEY")
supabase: Client=create_client(url,key)

def get_specific_user(user_id: int):
    resp = supabase.table("users").select("*").eq("id",user_id).single().execute()
    print(resp.data)
    return resp

def get_feedbacks():
    try:
        resp = supabase.table("feedback").select("*").execute()
    except Exception as e:
        print("Error fetching feedbacks:", str(e))
        raise e
    return resp