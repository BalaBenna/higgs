"""
One-time migration: create the 'characters' table in Supabase.
Run from the server directory:  python create_characters_table.py
"""

import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

SQL = """
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style TEXT DEFAULT 'Realistic',
  description TEXT DEFAULT '',
  reference_images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_user_created
  ON characters(user_id, created_at DESC);
"""


async def main():
    from supabase._async.client import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        print("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set")
        return

    sb = await create_client(url, key)

    # Use the postgrest rpc if available, otherwise try direct REST
    try:
        result = await sb.postgrest.rpc("exec_sql", {"query": SQL}).execute()
        print("Created via RPC:", result.data)
    except Exception as e:
        print(f"RPC not available ({e}), trying via raw SQL endpoint...")
        # Use the management API / SQL editor endpoint
        import httpx

        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        # Supabase exposes a /rest/v1/rpc endpoint; if exec_sql doesn't exist
        # we need to use the SQL editor REST endpoint
        sql_url = url.replace(".supabase.co", ".supabase.co") + "/rest/v1/rpc/exec_sql"
        async with httpx.AsyncClient() as client:
            resp = await client.post(sql_url, json={"query": SQL}, headers=headers)
            if resp.status_code < 300:
                print("Success:", resp.text)
            else:
                print(f"HTTP {resp.status_code}: {resp.text}")
                print(
                    "\n⚠️  The exec_sql RPC function does not exist in your Supabase project."
                    "\n\nPlease run this SQL manually in the Supabase SQL Editor"
                    "\n(Dashboard → SQL Editor → New query):\n"
                )
                print(SQL)


if __name__ == "__main__":
    asyncio.run(main())
