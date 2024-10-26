from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

def connect_supabase():
    # Retrieve the environment variables
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    print(SUPABASE_URL)
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    print(SUPABASE_KEY)
    
    # Initialize the Supabase client
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def query(table_name):
    supabase = connect_supabase()
    response = supabase.table(table_name).select("*").execute()
    return response.data
