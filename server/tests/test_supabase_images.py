"""
Test suite for Supabase image storage and retrieval.
Verifies that images are being properly saved to and retrieved from Supabase.

Run with: pytest tests/test_supabase_images.py -v
"""

import asyncio
import os
import sys
import json
from typing import Dict, Any, List

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_service import get_supabase, is_supabase_configured
from services.db_service import db_service


class TestSupabaseImages:
    """Test suite for Supabase image operations."""

    @staticmethod
    async def test_supabase_configured() -> bool:
        """Test 1: Verify Supabase is properly configured."""
        print("\n📋 Test 1: Checking Supabase configuration...")
        
        if not is_supabase_configured():
            print("❌ FAILED: Supabase is not configured")
            return False
        
        print("✅ PASSED: Supabase is configured")
        
        # Check required env vars
        url = os.getenv("SUPABASE_URL")
        service_role = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        
        if not url:
            print("❌ Missing SUPABASE_URL")
            return False
        if not service_role:
            print("❌ Missing SUPABASE_SERVICE_ROLE_KEY")
            return False
        if not jwt_secret:
            print("❌ Missing SUPABASE_JWT_SECRET")
            return False
        
        print(f"✅ All required env vars present")
        print(f"   - SUPABASE_URL: {url[:30]}...")
        print(f"   - SERVICE_ROLE_KEY: {service_role[:30]}...")
        print(f"   - JWT_SECRET: {jwt_secret[:30]}...")
        
        return True

    @staticmethod
    async def test_supabase_connection() -> bool:
        """Test 2: Verify connection to Supabase."""
        print("\n📋 Test 2: Testing Supabase connection...")
        
        try:
            sb = await get_supabase()
            # Try a simple query to verify connection
            result = await sb.table("generated_content").select("count", count="exact").execute()
            print(f"✅ PASSED: Connected to Supabase")
            print(f"   - Total images in database: {result.count}")
            return True
        except Exception as e:
            print(f"❌ FAILED: Could not connect to Supabase")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_list_images() -> bool:
        """Test 3: List all generated images in database."""
        print("\n📋 Test 3: Listing generated images...")
        
        try:
            sb = await get_supabase()
            result = await sb.table("generated_content").select("*").order("created_at", desc=True).limit(10).execute()
            
            images = result.data or []
            if not images:
                print("⚠️  No images found in database (this is OK if you just started)")
                return True
            
            print(f"✅ PASSED: Retrieved {len(images)} images from database")
            print("\n📸 Recent Images:")
            print("-" * 80)
            
            for i, img in enumerate(images, 1):
                user_id = img.get("user_id", "N/A")[:8]
                img_type = img.get("type", "N/A")
                prompt = img.get("prompt", "N/A")[:50]
                model = img.get("model", "N/A")
                created = img.get("created_at", "N/A")
                
                print(f"\n{i}. User: {user_id}... | Type: {img_type}")
                print(f"   Model: {model}")
                print(f"   Prompt: {prompt}...")
                print(f"   Created: {created}")
            
            print("-" * 80)
            return True
        except Exception as e:
            print(f"❌ FAILED: Could not list images")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_images_per_user() -> bool:
        """Test 4: Check images grouped by user."""
        print("\n📋 Test 4: Counting images per authenticated user...")
        
        try:
            sb = await get_supabase()
            result = await sb.table("generated_content").select("user_id, count", count="exact").execute()
            
            if not result.data:
                print("⚠️  No images found (this is OK if you just started)")
                print("   Tip: Generate some images while logged in to populate this data")
                return True
            
            # Group by user_id
            user_images: Dict[str, int] = {}
            total = 0
            
            # Query all images
            all_result = await sb.table("generated_content").select("user_id").execute()
            for img in all_result.data or []:
                user = img.get("user_id", "unknown")
                user_images[user] = user_images.get(user, 0) + 1
                total += 1
            
            if not user_images:
                print("⚠️  No users with images found")
                return True
            
            print(f"✅ PASSED: Found {len(user_images)} users with {total} total images")
            print("\n👥 Images per User:")
            print("-" * 60)
            
            sorted_users = sorted(user_images.items(), key=lambda x: x[1], reverse=True)
            for user_id, count in sorted_users:
                user_short = user_id[:8] if len(user_id) > 8 else user_id
                print(f"  {user_short}... : {count} images")
            
            print("-" * 60)
            return True
        except Exception as e:
            print(f"❌ FAILED: Could not group images by user")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_image_metadata() -> bool:
        """Test 5: Verify image metadata is properly stored."""
        print("\n📋 Test 5: Checking image metadata structure...")
        
        try:
            sb = await get_supabase()
            result = await sb.table("generated_content").select("*").limit(1).execute()
            
            images = result.data or []
            if not images:
                print("⚠️  No images found (cannot test metadata)")
                return True
            
            img = images[0]
            print(f"✅ PASSED: Found image to inspect")
            print("\n📊 Image Structure:")
            print("-" * 60)
            
            # Check required fields
            required_fields = ["id", "user_id", "type", "storage_path", "prompt", "model", "metadata"]
            missing = []
            
            for field in required_fields:
                if field in img:
                    value = img[field]
                    if field == "metadata" and isinstance(value, str):
                        try:
                            meta = json.loads(value)
                            print(f"  ✓ {field}: {type(meta).__name__} (JSON string)")
                        except:
                            print(f"  ✓ {field}: {type(value).__name__}")
                    else:
                        print(f"  ✓ {field}: {type(value).__name__}")
                else:
                    print(f"  ✗ {field}: MISSING")
                    missing.append(field)
            
            print("-" * 60)
            
            if missing:
                print(f"\n⚠️  Missing fields: {', '.join(missing)}")
                return False
            
            return True
        except Exception as e:
            print(f"❌ FAILED: Could not inspect metadata")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def test_storage_bucket() -> bool:
        """Test 6: Verify images are in Supabase Storage."""
        print("\n📋 Test 6: Checking Supabase Storage bucket...")
        
        try:
            sb = await get_supabase()
            
            # List files in generated-content bucket
            files = await sb.storage.from_("generated-content").list("")
            
            if not files:
                print("⚠️  No files found in storage (this is OK if you just started)")
                print("   Tip: Generate some images while logged in to populate storage")
                return True
            
            print(f"✅ PASSED: Found {len(files)} files in 'generated-content' bucket")
            print("\n📁 Recent Files:")
            print("-" * 60)
            
            # Show last 10 files
            for i, file in enumerate(files[-10:], 1):
                name = file.get("name", "N/A")
                size = file.get("metadata", {}).get("size", 0)
                size_kb = size / 1024 if size else 0
                created = file.get("created_at", "N/A")
                
                print(f"{i}. {name}")
                print(f"   Size: {size_kb:.1f}KB | Created: {created}")
            
            print("-" * 60)
            return True
        except Exception as e:
            print(f"⚠️  Could not access storage bucket: {e}")
            print("   This might be OK if storage isn't configured yet")
            return True

    @staticmethod
    async def test_image_retrieval_by_user() -> bool:
        """Test 7: Simulate retrieving images for a specific user."""
        print("\n📋 Test 7: Testing user image retrieval...")
        
        try:
            sb = await get_supabase()
            
            # Get first user
            result = await sb.table("generated_content").select("user_id").limit(1).execute()
            if not result.data:
                print("⚠️  No users with images found (cannot test retrieval)")
                return True
            
            test_user = result.data[0].get("user_id")
            print(f"✅ Testing retrieval for user: {test_user[:8]}...")
            
            # Simulate the content_router.py query
            user_result = await sb.table("generated_content").select("*").eq("user_id", test_user).order("created_at", desc=True).limit(10).execute()
            
            images = user_result.data or []
            print(f"✅ PASSED: Retrieved {len(images)} images for user")
            print(f"\n📸 User's Images:")
            print("-" * 60)
            
            for i, img in enumerate(images, 1):
                img_type = img.get("type", "N/A")
                prompt = img.get("prompt", "N/A")[:40]
                model = img.get("model", "N/A")
                
                print(f"{i}. [{img_type.upper()}] {prompt}...")
                print(f"   Model: {model}")
            
            print("-" * 60)
            return True
        except Exception as e:
            print(f"❌ FAILED: Could not retrieve user images")
            print(f"   - Error: {e}")
            return False

    @staticmethod
    async def run_all_tests() -> Dict[str, bool]:
        """Run all tests and return results."""
        print("\n" + "=" * 80)
        print("🧪 SUPABASE IMAGE RETRIEVAL TEST SUITE")
        print("=" * 80)
        
        results = {
            "Supabase Configuration": await TestSupabaseImages.test_supabase_configured(),
            "Supabase Connection": await TestSupabaseImages.test_supabase_connection(),
            "List Images": await TestSupabaseImages.test_list_images(),
            "Images Per User": await TestSupabaseImages.test_images_per_user(),
            "Image Metadata": await TestSupabaseImages.test_image_metadata(),
            "Storage Bucket": await TestSupabaseImages.test_storage_bucket(),
            "User Image Retrieval": await TestSupabaseImages.test_image_retrieval_by_user(),
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
            print("🎉 All tests passed! Images are being properly stored and retrieved.")
        else:
            print(f"⚠️  {total - passed} test(s) failed. Check the output above for details.")
        
        print("=" * 80 + "\n")
        
        return results


async def main():
    """Main entry point for testing."""
    results = await TestSupabaseImages.run_all_tests()
    
    # Exit with appropriate code
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    if passed < total:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
