-- HouseParty Arcade Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Create the rooms table for persistent game state
CREATE TABLE IF NOT EXISTS public.rooms (
  room_code TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on room_code for fast lookup
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON public.rooms (room_code);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous read/write access for party game players
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.rooms;
CREATE POLICY "Allow anonymous read access"
  ON public.rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.rooms;
CREATE POLICY "Allow anonymous insert access"
  ON public.rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON public.rooms;
CREATE POLICY "Allow anonymous update access"
  ON public.rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Enable Supabase Realtime for the rooms table (Postgres changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;
