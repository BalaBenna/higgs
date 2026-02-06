import os
import asyncio
from dotenv import load_dotenv

# Load env from .env file
load_dotenv()

api_key = os.getenv("GOOGLE_VERTEX_AI_API_KEY")
print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai not installed.")
    exit(1)

def test_text():
    print("\n--- Testing Text Generation (models/gemini-2.0-flash) ---")
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='models/gemini-2.0-flash',
            contents='Hello',
        )
        if response.text:
            print("SUCCESS: Text generated!")
            print(f"Response: {response.text[:20]}...")
        else:
            print("FAILURE: No text.")
    except Exception as e:
        print(f"TEXT ERROR: {e}")

def test_image():
    print("\n--- Testing Image Generation (models/imagen-4.0-generate-001) ---")
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model='models/imagen-4.0-generate-001',
            prompt='A robot',
            config=types.GenerateImagesConfig(number_of_images=1)
        )
        if response.generated_images:
            print("SUCCESS: Image generated!")
        else:
            print("FAILURE: No images.")
    except Exception as e:
        print(f"IMAGE ERROR: {e}")

if __name__ == "__main__":
    test_text()
    test_image()
