from . import Migration
import sqlite3


class V4AddVibeMotionProjects(Migration):
    version = 4
    description = "Add vibe_motion_projects table"

    def up(self, conn: sqlite3.Connection) -> None:
        conn.execute("""
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
                media_urls TEXT,
                thumbnail TEXT DEFAULT '',
                created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'))
            )
        """)

        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_vibe_motion_projects_updated_at 
            ON vibe_motion_projects(updated_at DESC, id DESC)
        """)

    def down(self, conn: sqlite3.Connection) -> None:
        conn.execute("DROP TABLE IF EXISTS vibe_motion_projects")
