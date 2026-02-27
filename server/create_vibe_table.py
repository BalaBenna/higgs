"""
Create vibe_motion_projects table in Supabase using direct Postgres connection.
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
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "")

if not SUPABASE_URL:
    print("Error: SUPABASE_URL not set")
    sys.exit(1)

# Extract project ref from URL
# URL format: https://bfkjhqgnqqeqxxntxmjp.supabase.co
project_ref = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")

print(f"Project ref: {project_ref}")

# Construct database URL
# Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
if SUPABASE_DB_PASSWORD:
    db_url = f"postgresql://postgres.{project_ref}:{SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
else:
    # Try direct connection with service role as password hint
    print("SUPABASE_DB_PASSWORD not set, trying alternative connection...")
    db_url = f"postgresql://postgres.{project_ref}:{SUPABASE_SERVICE_ROLE_KEY[:20]}@db.{project_ref}.supabase.co:5432/postgres"


async def create_table():
    try:
        import asyncpg
    except ImportError:
        print("asyncpg not installed, installing...")
        import subprocess

        subprocess.run([sys.executable, "-m", "pip", "install", "asyncpg", "-q"])
        import asyncpg

    print(f"Connecting to database...")
    print(f"Connection string: {db_url[:50]}...")

    try:
        conn = await asyncpg.connect(db_url)
    except Exception as e:
        print(f"Connection failed: {e}")
        print("")
        print("Please run this SQL manually in your Supabase Dashboard:")
        print("1. Go to https://supabase.com/dashboard")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Run the following SQL:")
        print("")
        print(get_sql())
        return

    try:
        print("Creating table...")
        await conn.execute(get_sql())
        print("Table created successfully!")
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        await conn.close()


def get_sql():
    return """
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

ALTER TABLE vibe_motion_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON vibe_motion_projects
    FOR ALL USING (true) WITH CHECK (true);
"""


if __name__ == "__main__":
    asyncio.run(create_table())
