import requests
import json
# getpass is no longer needed as we are hardcoding the password.

# --- Configuration ---
# API endpoint for creating links
API_URL = "https://dtrbuomodpheqtazsghp.supabase.co/rest/v1/links?select=id"

# New Authentication Endpoint
AUTH_URL = "https://dtrbuomodpheqtazsghp.supabase.co/auth/v1/token?grant_type=password"

# This is the public key for the Supabase project.
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cmJ1b21vZHBoZXF0YXpzZ2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Njk4MjMsImV4cCI6MjA2NzE0NTgyM30.L_xCuYvkRvmO7gzvYhJFzQ3_86NMOQnIoF3MYvGJsKE"


def get_auth_token(email, password):
    """
    Logs into the Supabase authentication endpoint to get a valid JWT.

    Args:
        email (str): The user's email address.
        password (str): The user's password.

    Returns:
        tuple: A tuple containing the auth token (str) and user ID (str), or (None, None) on failure.
    """
    if not password or password == "YOUR_PASSWORD_HERE":
        print("\n❌ ERROR: Please set your password in the USER_PASSWORD variable at the bottom of the script.")
        return None, None
        
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": email,
        "password": password
    }

    try:
        print("Attempting to get authentication token...")
        response = requests.post(AUTH_URL, headers=headers, data=json.dumps(payload))
        response.raise_for_status() # Raise an exception for bad status codes

        auth_data = response.json()
        access_token = auth_data.get("access_token")
        user_id = auth_data.get("user", {}).get("id")

        if not access_token or not user_id:
            print("\n❌ Could not find access token or user ID in the response.")
            return None, None
            
        print("✅ Successfully obtained new authentication token.")
        return access_token, user_id

    except requests.exceptions.HTTPError as http_err:
        print(f"\n❌ Login Failed: {http_err}")
        if response.status_code == 400:
            print("   (This usually means incorrect email or password.)")
        print(f"   Response Body: {response.text}")
        return None, None
    except Exception as err:
        print(f"\n❌ An unexpected error occurred during authentication: {err}")
        return None, None


def create_redirect_link(title, destination_url, slug, auth_token, user_id):
    """
    Sends a POST request to the Supabase API to create a new redirect link.
    """
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
        # CORRECTED HEADER: Tells the server to return the created object as JSON.
        "Prefer": "return=representation",
    }
    payload = {
        "title": title,
        "destination_url": destination_url,
        "slug": slug,
        "user_id": user_id,
        "domain": "girly.bio",
        "is_active": True,
    }

    print("Sending request to create link...")
    try:
        response = requests.post(API_URL, headers=headers, data=json.dumps(payload))
        response.raise_for_status()

        # This part should now work correctly because the server will return JSON.
        if response.status_code == 201:
            new_link_data = response.json()
            new_link_id = new_link_data[0].get('id')
            print("\n✅ Success! Link created.")
            print(f"   New Link ID: {new_link_id}")
            print(f"   URL: https://girly.bio/{slug}")
        else:
            print(f"\n❌ An unexpected status code occurred: {response.status_code}")
            print(f"   Response: {response.text}")

    except requests.exceptions.HTTPError as http_err:
        print(f"\n❌ HTTP Error occurred: {http_err}")
        print(f"   Response Body: {response.text}")
    except json.JSONDecodeError:
        print("\n❌ JSON Decode Error: The server did not return valid JSON.")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Body: '{response.text}'")
    except Exception as err:
        print(f"\n❌ An unexpected error occurred: {err}")


if __name__ == "__main__":
    print("--- Girly.bio Link Creator (Automated Login) ---")
    
    # --- Step 1: Get credentials and authenticate ---
    user_email = "hotman324324@gmail.com"
    
    # ==============================================================================
    # WARNING: Storing passwords in code is a major security risk.
    # This should only be done in a secure, isolated environment for testing.
    # Do NOT do this in a real application or share this file with the password in it.
    # ==============================================================================
    USER_PASSWORD = "Furda2-kyspyn-bakgot"  # <-- SET YOUR PASSWORD HERE

    print(f"Logging in as: {user_email}")
    
    token, current_user_id = get_auth_token(user_email, USER_PASSWORD)
    
    # --- Step 2: If authentication is successful, create the link ---
    if token and current_user_id:
        print("\n--- Create a new link ---")
        input_title = input("Enter the title for your link: ")
        input_destination = input("Enter the destination URL (e.g., https://google.com): ")
        input_slug = input("Enter the custom slug (the part after girly.bio/): ")

        create_redirect_link(input_title, input_destination, input_slug, token, current_user_id)

