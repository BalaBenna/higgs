"""
Create vibe_motion_projects table in Supabase using direct HTTP request.
Run this script to set up the database schema.
"""

import os
import sys
import asyncio
import httpx

# Load .env file
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    print(f"Loading environment from {env_path}")
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                try:
                    key, value = line.split("=", 1)
                    os.environ[key] = value.strip()
                except ValueError:
                    continue

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

# SQL to create the table
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS vibe_motion_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    preset TEXT NOT NULL,
    prompt TEXT,
    code TEXT,
    model TEXT DEFAULT 'gpt-4o',
    style TEXT,
    theme TEXT,
    duration INTEGER DEFAULT 10,
    aspect_ratio TEXT DEFAULT '16:9',
    transition TEXT DEFAULT 'auto',
    transition_direction TEXT DEFAULT 'from-left',
    media_urls JSONB,
    thumbnail TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

# SQL to enable RLS and create policy
RLS_SQL = """
ALTER TABLE vibe_motion_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations" ON vibe_motion_projects;
CREATE POLICY "Allow all operations" ON vibe_motion_projects
    FOR ALL USING (true) WITH CHECK (true);
"""


async def create_table():
    # First, check if table exists
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    async with httpx.AsyncClient() as client:
        # Try to query the table first
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/vibe_motion_projects?select=id&limit=1",
                headers=headers,
                timeout=10,
            )
            if response.status_code == 200:
                print("Table vibe_motion_projects already exists!")
                return
        except Exception as e:
            print(f"Table doesn't exist yet, creating...")

        # Use Supabase's postgREST to execute SQL via RPC
        # First, enable the extension for pgSQL
        print("Creating table via direct SQL...")

        # Try using the /pg/ endpoint
        try:
            # Create table
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=headers,
                json={"query": CREATE_TABLE_SQL},
                timeout=30,
            )
            print(f"Create table response: {response.status_code}")
            if response.status_code >= 400:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Could not create table via RPC: {e}")

        # Try to enable RLS
        try:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=headers,
                json={"query": RLS_SQL},
                timeout=30,
            )
            print(f"RLS response: {response.status_code}")
        except Exception as e:
            print(f"Could not enable RLS via RPC: {e}")

        # Verify table was created
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/vibe_motion_projects?select=id&limit=1",
                headers=headers,
                timeout=10,
            )
            if response.status_code == 200:
                print("\n✅ Table vibe_motion_projects created successfully!")
                return
        except Exception as e:
            pass

        print("\n" + "=" * 60)
        print("Please run this SQL manually in your Supabase SQL Editor:")
        print("(Dashboard > SQL Editor)")
        print("=" * 60)
        print(CREATE_TABLE_SQL)
        print(RLS_SQL)
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(create_table())
