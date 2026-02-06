import os
import asyncio
from dotenv import load_dotenv

# Load .env
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    # Try vertex key if separate
    api_key = os.getenv("GOOGLE_VERTEX_AI_API_KEY")

print(f"Using API Key: {api_key[:5]}...{api_key[-5:] if api_key else ''}")

try:
    from google import genai
    
    client = genai.Client(api_key=api_key)
    
    print("\nListing IMAGEN models...")
    found = False
    for model in client.models.list():
        if "imagen" in model.name.lower():
            print(f"FOUND: {model.name}")
            found = True
            
    if not found:
        print("No Imagen models found.")
        
except Exception as e:
    print(f"Error listing models: {e}")
