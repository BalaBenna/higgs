-- =============================================================================
-- Jaaz Supabase Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- All statements are idempotent (safe to re-run)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles — mirrors auth.users for queryable user data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. canvases — user canvas designs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.canvases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  description TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canvases_user_updated
  ON canvases(user_id, updated_at DESC);

-- ---------------------------------------------------------------------------
-- 3. chat_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT,
  model TEXT,
  provider TEXT,
  canvas_id TEXT REFERENCES canvases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
  ON chat_sessions(user_id, updated_at DESC);

-- ---------------------------------------------------------------------------
-- 4. chat_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT,
  message JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(session_id, id);

-- ---------------------------------------------------------------------------
-- 5. generated_content
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video')),
  storage_path TEXT,
  prompt TEXT,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_content_user
  ON generated_content(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. comfy_workflows
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comfy_workflows (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  api_json JSONB,
  description TEXT DEFAULT '',
  inputs JSONB,
  outputs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Auto-create profile on signup (trigger)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Row Level Security (RLS) policies
-- =============================================================================

-- Enable RLS on all user-scoped tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Canvases: users can CRUD their own canvases
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own canvases' AND tablename = 'canvases') THEN
    CREATE POLICY "Users can view own canvases" ON public.canvases FOR SELECT USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create canvases' AND tablename = 'canvases') THEN
    CREATE POLICY "Users can create canvases" ON public.canvases FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own canvases' AND tablename = 'canvases') THEN
    CREATE POLICY "Users can update own canvases" ON public.canvases FOR UPDATE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own canvases' AND tablename = 'canvases') THEN
    CREATE POLICY "Users can delete own canvases" ON public.canvases FOR DELETE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

-- Chat sessions: users can CRUD their own sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sessions' AND tablename = 'chat_sessions') THEN
    CREATE POLICY "Users can view own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create sessions' AND tablename = 'chat_sessions') THEN
    CREATE POLICY "Users can create sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own sessions' AND tablename = 'chat_sessions') THEN
    CREATE POLICY "Users can update own sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own sessions' AND tablename = 'chat_sessions') THEN
    CREATE POLICY "Users can delete own sessions" ON public.chat_sessions FOR DELETE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

-- Chat messages: users can access messages from their own sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own messages' AND tablename = 'chat_messages') THEN
    CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT
      USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id::text = auth.uid()::text));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create messages' AND tablename = 'chat_messages') THEN
    CREATE POLICY "Users can create messages" ON public.chat_messages FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id::text = auth.uid()::text));
  END IF;
END $$;

-- Generated content: users can CRUD their own content
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own content' AND tablename = 'generated_content') THEN
    CREATE POLICY "Users can view own content" ON public.generated_content FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create content' AND tablename = 'generated_content') THEN
    CREATE POLICY "Users can create content" ON public.generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own content' AND tablename = 'generated_content') THEN
    CREATE POLICY "Users can delete own content" ON public.generated_content FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Note: The backend uses the service_role key which bypasses RLS automatically.

-- =============================================================================
-- Backfill: create profiles for existing auth users who don't have one
-- =============================================================================
INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
  COALESCE(u.raw_app_meta_data->>'provider', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
