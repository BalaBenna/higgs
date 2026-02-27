"""
Setup script to create the vibe_motion_projects table in Supabase.
Run this once to set up the database schema.
"""

import os
import sys
import asyncio

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


async def create_table():
    from supabase._async.client import create_client

    sb = await create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    # SQL to create the table
    create_table_sql = """
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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    """

    # SQL to enable RLS and create policy
    rls_sql = """
    ALTER TABLE vibe_motion_projects ENABLE ROW LEVEL SECURITY;
    
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'vibe_motion_projects' AND policyname = 'Allow all operations'
        ) THEN
            CREATE POLICY "Allow all operations" ON vibe_motion_projects
                FOR ALL USING (true) WITH CHECK (true);
        END IF;
    END $$;
    """

    try:
        # Execute the SQL using rpc
        print("Creating vibe_motion_projects table...")

        # Use the REST API to execute raw SQL
        import httpx

        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

        # Execute SQL via the /rest/v1/rpc endpoint
        # We need to use the pg_net extension or direct SQL
        # Let's try using the table API to check if it exists first

        # Check if table exists by trying to select from it
        try:
            result = (
                await sb.table("vibe_motion_projects").select("id").limit(1).execute()
            )
            print("Table vibe_motion_projects already exists!")
            return
        except Exception as e:
            if "does not exist" in str(e) or "404" in str(e) or "relation" in str(e):
                print("Table does not exist, creating it...")
            else:
                raise e

        # Use Supabase Management API to run SQL
        # This requires the service role key
        url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"

        response = await sb.rpc("exec_sql", {"query": create_table_sql}).execute()
        print(f"Create table result: {response}")

        response2 = await sb.rpc("exec_sql", {"query": rls_sql}).execute()
        print(f"RLS result: {response2}")

        print("Table created successfully!")

    except Exception as e:
        print(f"Error creating table via RPC: {e}")
        print("")
        print("Please run this SQL manually in your Supabase SQL Editor:")
        print("=" * 60)
        print(create_table_sql)
        print(rls_sql)
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(create_table())
