"""Test video generation endpoint"""
import requests

url = "http://127.0.0.1:57989/api/generate/video"
data = {
    "tool": "generate_video_by_kling_v25_turbo_replicate",
    "prompt": "cat and dog fighting",
    "duration": "5",
    "aspect_ratio": "16:9",
    "resolution": "480p"
}

print("Sending video generation request...")
try:
    response = requests.post(url, data=data, timeout=300)  # 5 min timeout for video gen
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Success! Response: {response.json()}")
    else:
        print(f"Error response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
