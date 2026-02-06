import requests
import json

url = "http://127.0.0.1:57989/api/generate/image"
payload = {
    "tool": "generate_image_by_imagen_4_jaaz",
    "prompt": "A testing robot",
    "num_images": 1,
    "aspect_ratio": "1:1"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
