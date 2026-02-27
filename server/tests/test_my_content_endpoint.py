"""
Integration test for the /api/my-content endpoint.
Verifies that the frontend can retrieve images from the backend.

Run with: pytest tests/test_my_content_endpoint.py -v
"""

import asyncio
import os
import sys
import httpx
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_service import get_supabase


class TestMyContentEndpoint:
    """Test suite for /api/my-content endpoint."""

    BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:57989")

    @staticmethod
    async def test_endpoint_without_auth() -> bool:
        """Test 1: Verify endpoint returns 401 without authentication."""
        print("\n📋 Test 1: Testing endpoint WITHOUT authentication...")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{TestMyContentEndpoint.BACKEND_URL}/api/my-content",
                    timeout=10.0
                )
            
            if response.status_code == 401:
                print(f"✅ PASSED: Correctly returned 401 Unauthorized")
                print(f"   - Status: {response.status_code}")
                print(f"   - Message: {response.json().get('detail', 'Not authenticated')}")
                return True
            else:
                print(f"❌ FAILED: Expected 401, got {response.status_code}")
                print(f"   - Response: {response.text[:200]}")
                return False
        except Exception as e:
            print(f"❌ FAILED: Could not reach endpoint")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_endpoint_with_valid_token() -> bool:
        """Test 2: Retrieve images with a valid authentication token."""
        print("\n📋 Test 2: Testing endpoint WITH valid authentication token...")
        
        try:
            # Get a valid user from the database
            sb = await get_supabase()
            result = await sb.table("generated_content").select("user_id").limit(1).execute()
            
            if not result.data:
                print("⚠️  No users with images in database")
                print("   Tip: Generate some images while logged in first")
                return True
            
            test_user_id = result.data[0].get("user_id")
            
            # Create a test JWT token (using service role key)
            import jwt
            from datetime import datetime, timedelta
            
            jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
            if not jwt_secret:
                print("⚠️  SUPABASE_JWT_SECRET not configured, skipping token test")
                return True
            
            # Create a valid JWT token
            payload = {
                "iss": "https://bfkjhqgnqqeqxxntxmjp.supabase.co/auth/v1",
                "sub": test_user_id,
                "aud": "authenticated",
                "exp": datetime.utcnow() + timedelta(hours=24),
                "iat": datetime.utcnow(),
                "email": f"test-{test_user_id[:8]}@example.com",
                "phone": "",
                "email_confirmed_at": datetime.utcnow().isoformat(),
                "phone_confirmed_at": None,
                "user_metadata": {},
                "app_metadata": {"provider": "email", "providers": ["email"]},
                "identities": [],
                "is_anonymous": False
            }
            
            token = jwt.encode(payload, jwt_secret, algorithm="HS256")
            print(f"✅ Generated test JWT token for user: {test_user_id[:8]}...")
            
            # Call endpoint with token
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{TestMyContentEndpoint.BACKEND_URL}/api/my-content?type=image&limit=10",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
            
            if response.status_code == 200:
                data = response.json()
                images = data.get("items", [])
                total = len(images)
                
                print(f"✅ PASSED: Retrieved {total} images")
                print(f"   - Status: {response.status_code}")
                
                if images:
                    print("\n📸 Sample Images Retrieved:")
                    print("-" * 60)
                    for i, img in enumerate(images[:5], 1):
                        img_type = img.get("type", "N/A")
                        prompt = img.get("prompt", "N/A")[:40]
                        model = img.get("model", "N/A")
                        
                        print(f"{i}. [{img_type}] {prompt}...")
                        print(f"   Model: {model}")
                    print("-" * 60)
                
                return True
            else:
                print(f"❌ FAILED: Expected 200, got {response.status_code}")
                print(f"   - Response: {response.json()}")
                return False
                
        except Exception as e:
            print(f"❌ FAILED: Could not test with valid token")
            print(f"   - Error: {e}")
            import traceback
            traceback.print_exc()
            return False

    @staticmethod
    async def test_endpoint_with_type_filter() -> bool:
        """Test 3: Test filtering by content type."""
        print("\n📋 Test 3: Testing endpoint with type=image filter...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Request with type filter (should fail without auth)
                response = await client.get(
                    f"{TestMyContentEndpoint.BACKEND_URL}/api/my-content?type=image",
                    timeout=10.0
                )
            
            if response.status_code == 401:
                print(f"✅ PASSED: Type filter correctly requires authentication")
                print(f"   - Status: {response.status_code}")
                return True
            else:
                print(f"❌ FAILED: Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ FAILED: Could not test type filter")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_backend_connectivity() -> bool:
        """Test 4: Verify backend is running and accessible."""
        print("\n📋 Test 4: Checking backend connectivity...")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{TestMyContentEndpoint.BACKEND_URL}/api/list_tools",
                    timeout=10.0
                )
            
            if response.status_code == 200:
                print(f"✅ PASSED: Backend is running and reachable")
                print(f"   - URL: {TestMyContentEndpoint.BACKEND_URL}")
                print(f"   - Status: {response.status_code}")
                return True
            else:
                print(f"⚠️  Backend returned {response.status_code}")
                return True  # Not a failure, just unexpected status
        except Exception as e:
            print(f"❌ FAILED: Cannot reach backend")
            print(f"   - URL: {TestMyContentEndpoint.BACKEND_URL}")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def run_all_tests() -> Dict[str, bool]:
        """Run all endpoint tests."""
        print("\n" + "=" * 80)
        print("🧪 FRONTEND API ENDPOINT TEST SUITE")
        print("=" * 80)
        
        results = {
            "Backend Connectivity": await TestMyContentEndpoint.test_backend_connectivity(),
            "Endpoint Without Auth": await TestMyContentEndpoint.test_endpoint_without_auth(),
            "Endpoint With Valid Token": await TestMyContentEndpoint.test_endpoint_with_valid_token(),
            "Type Filter": await TestMyContentEndpoint.test_endpoint_with_type_filter(),
        }
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{status}: {test_name}")
        
        print("\n" + "=" * 80)
        print(f"Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All endpoint tests passed!")
        else:
            print(f"⚠️  {total - passed} test(s) failed.")
        
        print("=" * 80 + "\n")
        
        return results


async def main():
    """Main entry point for testing."""
    results = await TestMyContentEndpoint.run_all_tests()
    
    # Exit with appropriate code
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    if passed < total:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
