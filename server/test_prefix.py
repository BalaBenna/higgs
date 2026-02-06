import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_VERTEX_AI_API_KEY")

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai not installed")
    exit(1)

def test_model(model_name):
    print(f"\nTesting {model_name}...")
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model=model_name,
            prompt='A small red box',
            config=types.GenerateImagesConfig(number_of_images=1)
        )
        if response.generated_images:
            print(f"SUCCESS: {model_name} works!")
            return True
        else:
            print(f"FAILURE: {model_name} returned no images.")
            return False
    except Exception as e:
        print(f"ERROR with {model_name}: {e}")
        return False

if __name__ == "__main__":
    # Test WITHOUT prefix
    v1 = test_model("imagen-4.0-generate-001")
    # Test WITH prefix
    v2 = test_model("models/imagen-4.0-generate-001")
    
    print("\n--- SUMMARY ---")
    print(f"Without Prefix: {'WORKS' if v1 else 'FAILED'}")
    print(f"With Prefix:    {'WORKS' if v2 else 'FAILED'}")
