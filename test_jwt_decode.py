"""
Quick test to decode a Supabase JWT and check its algorithm.
Run: python test_jwt_decode.py
"""

import os
import base64
import json

# Load .env manually
env_path = os.path.join(os.path.dirname(__file__), "server", ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                try:
                    key, value = line.split("=", 1)
                    os.environ[key] = value.strip()
                except ValueError:
                    continue

print("=== JWT Debug Test ===")
print(f"SUPABASE_JWT_SECRET: {os.getenv('SUPABASE_JWT_SECRET', 'NOT SET')[:20]}...")

# Get a test token from command line or use a sample
test_token = input("\nPaste your JWT token (or press Enter to skip): ").strip()

if test_token:
    print("\n--- Decoding JWT Header (without verification) ---")
    try:
        header_segment = test_token.split(".")[0]
        padded = header_segment + "=" * (4 - len(header_segment) % 4)
        header = json.loads(base64.urlsafe_b64decode(padded))
        print(f"JWT Header: {json.dumps(header, indent=2)}")
        print(f"Algorithm: {header.get('alg')}")
        print(f"Type: {header.get('typ')}")
    except Exception as e:
        print(f"Error decoding header: {e}")

    print("\n--- Decoding JWT Payload (without verification) ---")
    try:
        payload_segment = test_token.split(".")[1]
        padded = payload_segment + "=" * (4 - len(payload_segment) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded))
        print(
            f"Payload (partial): sub={payload.get('sub')}, aud={payload.get('aud')}, exp={payload.get('exp')}"
        )
    except Exception as e:
        print(f"Error decoding payload: {e}")

    print("\n--- Attempting to verify with python-jose ---")
    try:
        from jose import jwt, JWTError

        secret = os.getenv("SUPABASE_JWT_SECRET", "")
        print(f"Secret length: {len(secret)}")

        # Try with raw secret
        print("\nTrying with raw secret...")
        try:
            payload = jwt.decode(
                test_token,
                secret,
                algorithms=["HS256", "HS384", "HS512"],
                audience="authenticated",
            )
            print(f"SUCCESS! User ID: {payload.get('sub')}")
        except JWTError as e:
            print(f"FAILED: {e}")

        # Try with base64 decoded secret
        print("\nTrying with base64-decoded secret...")
        try:
            secret_bytes = base64.b64decode(secret)
            payload = jwt.decode(
                test_token,
                secret_bytes,
                algorithms=["HS256", "HS384", "HS512"],
                audience="authenticated",
            )
            print(f"SUCCESS! User ID: {payload.get('sub')}")
        except Exception as e:
            print(f"FAILED: {e}")

    except ImportError:
        print("jose library not installed")
else:
    print("No token provided. Exiting.")
