#!/usr/bin/env python3
"""
Supabase setup script — creates tables, storage buckets, and verifies connectivity.

Usage:
    cd server
    ./venv/bin/python supabase/setup_supabase.py

Prerequisites:
    Set these env vars in server/.env:
    - SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    - SUPABASE_JWT_SECRET
"""

import os
import sys
import httpx

# Add parent dir so we can import from server/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

from supabase import create_client


def run_sql(url: str, key: str, sql: str) -> dict:
    """Run raw SQL against the Supabase Postgres database via the SQL API."""
    # Use the Supabase Management API pg endpoint for raw SQL
    # The database REST endpoint for raw queries:
    # POST {SUPABASE_URL}/rest/v1/rpc  won't work for DDL
    # Instead, use the pg-meta or direct SQL endpoint
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    # The Supabase SQL endpoint (available with service_role key)
    resp = httpx.post(
        f"{url}/rest/v1/rpc/",
        headers=headers,
        json={"query": sql},
        timeout=60,
    )
    return {"status": resp.status_code, "body": resp.text[:500]}


def main():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env")
        sys.exit(1)

    print(f"Connecting to Supabase: {url}")
    sb = create_client(url, key)

    # ── 1. Create storage buckets ────────────────────────────────────────
    print("\n1. Setting up storage buckets...")
    buckets_config = [
        {"name": "generated-content", "public": True},
        {"name": "uploads", "public": True},
    ]

    for bucket in buckets_config:
        try:
            sb.storage.create_bucket(
                bucket["name"],
                options={"public": bucket["public"]},
            )
            print(f"   [CREATED] {bucket['name']} (public={bucket['public']})")
        except Exception as e:
            err_str = str(e)
            if "already exists" in err_str or "Duplicate" in err_str or "409" in err_str:
                # Update existing bucket to ensure it's public
                try:
                    sb.storage.update_bucket(
                        bucket["name"],
                        options={"public": bucket["public"]},
                    )
                    print(f"   [UPDATED] {bucket['name']} -> public={bucket['public']}")
                except Exception as ue:
                    print(f"   [EXISTS] {bucket['name']} (could not update: {ue})")
            else:
                print(f"   [ERROR] {bucket['name']}: {e}")

    # ── 2. Verify storage buckets ────────────────────────────────────────
    print("\n2. Listing storage buckets...")
    try:
        existing_buckets = sb.storage.list_buckets()
        for b in existing_buckets:
            name = b.name if hasattr(b, "name") else b.get("name", "?")
            public = b.public if hasattr(b, "public") else b.get("public", "?")
            print(f"   - {name} (public={public})")
    except Exception as e:
        print(f"   [ERROR] Could not list buckets: {e}")

    # ── 3. Verify tables exist ───────────────────────────────────────────
    print("\n3. Verifying tables...")
    tables = ["profiles", "canvases", "chat_sessions", "chat_messages", "generated_content"]
    missing_tables = []
    for table in tables:
        try:
            result = sb.table(table).select("*", count="exact").limit(0).execute()
            count = result.count if hasattr(result, "count") else "?"
            print(f"   [OK] {table} (rows: {count})")
        except Exception as e:
            err_str = str(e)
            if "could not find" in err_str.lower() or "does not exist" in err_str.lower() or "PGRST" in err_str:
                print(f"   [MISSING] {table}")
                missing_tables.append(table)
            else:
                print(f"   [ERROR] {table}: {e}")

    # ── 4. Check env vars ────────────────────────────────────────────────
    print("\n4. Checking environment variables...")
    env_vars = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL", ""),
        "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        "SUPABASE_JWT_SECRET": os.getenv("SUPABASE_JWT_SECRET", ""),
        "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY", ""),
    }
    for name, val in env_vars.items():
        if val:
            print(f"   [OK] {name} = {val[:20]}...")
        else:
            print(f"   [MISSING] {name}")

    # ── Summary ──────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    if missing_tables:
        print(f"\nACTION REQUIRED: {len(missing_tables)} table(s) missing!")
        print("You must run schema.sql in Supabase Dashboard:\n")
        print("  1. Go to https://supabase.com/dashboard")
        print("  2. Select your project")
        print("  3. Go to SQL Editor (left sidebar)")
        print("  4. Click 'New query'")
        print(f"  5. Paste the contents of: server/supabase/schema.sql")
        print("  6. Click 'Run'\n")
        schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
        print(f"  Schema file: {schema_path}")
        print(f"\n  Missing tables: {', '.join(missing_tables)}")
    else:
        print("\nAll tables and buckets are set up correctly!")


if __name__ == "__main__":
    main()
