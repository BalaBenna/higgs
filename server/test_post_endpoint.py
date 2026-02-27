"""Quick test script to check if POST endpoint works"""
import requests

url = "http://127.0.0.1:57989/api/test_post"
data = {"test_param": "hello from requests"}

print("Sending POST request...")
try:
    response = requests.post(url, data=data, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
