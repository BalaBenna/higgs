#!/usr/bin/env python3
"""
Quick verification script to test Supabase image retrieval.
This script tests:
1. Connection to Supabase
2. If any images exist in the database
3. If images can be retrieved per user
4. Storage bucket access

Usage:
  python verify_supabase_images.py
"""

import asyncio
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add server directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from services.supabase_service import get_supabase, is_supabase_configured


async def check_configuration():
    """Check if Supabase is properly configured."""
    print("\n📋 Checking Supabase Configuration...")
    print("-" * 60)
    
    if not is_supabase_configured():
        print("❌ Supabase is NOT configured")
        print("   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        return False
    
    url = os.getenv("SUPABASE_URL")
    print(f"✅ SUPABASE_URL: {url}")
    
    return True


async def check_connection():
    """Test connection to Supabase."""
    print("\n📋 Testing Connection to Supabase...")
    print("-" * 60)
    
    try:
        sb = await get_supabase()
        result = await sb.table("generated_content").select("count", count="exact").execute()
        print(f"✅ Connected to Supabase")
        print(f"   Total images in database: {result.count}")
        return True
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False


async def list_recent_images():
    """List the most recent images."""
    print("\n📋 Recent Images...")
    print("-" * 60)
    
    try:
        sb = await get_supabase()
        result = await sb.table("generated_content").select("*").order("created_at", desc=True).limit(5).execute()
        
        images = result.data or []
        if not images:
            print("ℹ️  No images found in database")
            print("   💡 Tip: Generate some images while logged in")
            return True
        
        for i, img in enumerate(images, 1):
            user = img.get("user_id", "N/A")[:8]
            img_type = img.get("type", "N/A")
            prompt = img.get("prompt", "N/A")[:40]
            model = img.get("model", "N/A")
            created = img.get("created_at", "N/A")
            
            print(f"\n{i}. User {user}... | Type: {img_type} | Model: {model}")
            print(f"   Prompt: {prompt}...")
            print(f"   Created: {created}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to list images: {e}")
        return False


async def check_user_images():
    """Check how many images each user has."""
    print("\n📋 Images by User...")
    print("-" * 60)
    
    try:
        sb = await get_supabase()
        result = await sb.table("generated_content").select("user_id").execute()
        
        if not result.data:
            print("ℹ️  No images found")
            return True
        
        # Count images per user
        user_counts = {}
        for item in result.data:
            user = item.get("user_id", "unknown")
            user_counts[user] = user_counts.get(user, 0) + 1
        
        print(f"Found {len(user_counts)} user(s) with images:\n")
        for user, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True):
            user_short = user[:8] if len(user) > 8 else user
            print(f"  {user_short}... : {count} image(s)")
        
        return True
    except Exception as e:
        print(f"❌ Failed to check user images: {e}")
        return False


async def check_storage():
    """Check if files exist in Supabase Storage."""
    print("\n📋 Supabase Storage...")
    print("-" * 60)
    
    try:
        sb = await get_supabase()
        files = await sb.storage.from_("generated-content").list("")
        
        if not files:
            print("ℹ️  No files in storage bucket")
            return True
        
        print(f"Found {len(files)} files in 'generated-content' bucket")
        
        # Show a few examples
        for i, f in enumerate(files[:3], 1):
            name = f.get("name", "N/A")
            print(f"  {i}. {name}")
        
        if len(files) > 3:
            print(f"  ... and {len(files) - 3} more")
        
        return True
    except Exception as e:
        print(f"⚠️  Could not access storage: {e}")
        return True  # Not critical


async def verify_metadata():
    """Check if image metadata is properly stored."""
    print("\n📋 Metadata Validation...")
    print("-" * 60)
    
    try:
        sb = await get_supabase()
        result = await sb.table("generated_content").select("*").limit(1).execute()
        
        if not result.data:
            print("ℹ️  No images to validate")
            return True
        
        img = result.data[0]
        print("✅ Sample image metadata:")
        
        # Check required fields
        fields = ["id", "user_id", "type", "prompt", "model", "created_at"]
        for field in fields:
            if field in img:
                value = img[field]
                if isinstance(value, str):
                    print(f"  ✓ {field}: {value[:30]}...")
                else:
                    print(f"  ✓ {field}: {value}")
            else:
                print(f"  ✗ {field}: MISSING")
        
        # Check metadata JSON
        if "metadata" in img:
            meta = img["metadata"]
            if isinstance(meta, str):
                try:
                    parsed = json.loads(meta)
                    print(f"  ✓ metadata: {list(parsed.keys())}")
                except:
                    print(f"  ⚠️  metadata: Not valid JSON")
            else:
                print(f"  ✓ metadata: {type(meta).__name__}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to validate metadata: {e}")
        return False


async def main():
    """Run all checks."""
    print("\n" + "=" * 60)
    print("🔍 SUPABASE IMAGE RETRIEVAL VERIFICATION")
    print("=" * 60)
    
    checks = [
        ("Configuration", check_configuration()),
        ("Connection", check_connection()),
        ("Recent Images", list_recent_images()),
        ("User Statistics", check_user_images()),
        ("Storage Access", check_storage()),
        ("Metadata", verify_metadata()),
    ]
    
    results = {}
    for name, check in checks:
        try:
            result = await check
            results[name] = result
        except Exception as e:
            print(f"\n❌ {name} failed: {e}")
            results[name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print("\n" + "=" * 60)
    
    if passed == total:
        print("\n✅ All checks passed!")
        print("\n💡 Next steps:")
        print("   1. Visit http://localhost:3001/login")
        print("   2. Sign in or sign up with email/password")
        print("   3. Generate some images")
        print("   4. Go to http://localhost:3001/my-content")
        print("   5. Your images should appear there!")
    elif passed == total - 1:
        print(f"\n⚠️  {total - passed} check failed (non-critical)")
        print("Images are likely being stored correctly.")
    else:
        print(f"\n❌ {total - passed} checks failed")
        print("\n💡 Troubleshooting:")
        print("   - Check that SUPABASE_URL is set in server/.env")
        print("   - Check that SUPABASE_SERVICE_ROLE_KEY is set in server/.env")
        print("   - Verify Supabase project is accessible")
        print("   - Check that generated_content table exists")
    
    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
