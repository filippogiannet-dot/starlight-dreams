-- Fix trigger conflicts and add mindfulness features
-- Drop existing conflicting triggers first
DROP TRIGGER IF EXISTS update_dreams_updated_at ON public.dreams;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Recreate triggers with proper names
CREATE TRIGGER dreams_update_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiles_update_updated_at  
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for username if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_username_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
END $$;

-- Add mindfulness tables
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL DEFAULT 'general',
  audio_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_duration INTEGER DEFAULT 10,
  preferred_categories TEXT[] DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies only if they don't exist
DO $$ 
BEGIN
  -- Meditation sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meditation_sessions' AND policyname = 'Users can view their own sessions') THEN
    CREATE POLICY "Users can view their own sessions" ON public.meditation_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meditation_sessions' AND policyname = 'Users can create their own sessions') THEN
    CREATE POLICY "Users can create their own sessions" ON public.meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meditation_sessions' AND policyname = 'Users can update their own sessions') THEN
    CREATE POLICY "Users can update their own sessions" ON public.meditation_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- User preferences policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view their preferences') THEN
    CREATE POLICY "Users can view their preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can create their preferences') THEN
    CREATE POLICY "Users can create their preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update their preferences') THEN
    CREATE POLICY "Users can update their preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Session progress policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_progress' AND policyname = 'Users can view their progress') THEN
    CREATE POLICY "Users can view their progress" ON public.session_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_progress' AND policyname = 'Users can create their progress') THEN
    CREATE POLICY "Users can create their progress" ON public.session_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_progress' AND policyname = 'Users can update their progress') THEN
    CREATE POLICY "Users can update their progress" ON public.session_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add triggers for new tables
DROP TRIGGER IF EXISTS meditation_sessions_update_updated_at ON public.meditation_sessions;
CREATE TRIGGER meditation_sessions_update_updated_at
  BEFORE UPDATE ON public.meditation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS user_preferences_update_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_update_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS session_progress_update_updated_at ON public.session_progress;  
CREATE TRIGGER session_progress_update_updated_at
  BEFORE UPDATE ON public.session_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();