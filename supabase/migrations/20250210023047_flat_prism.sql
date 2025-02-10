/*
  # Initial Authentication and User Management Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `role` (text, default: 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sleep_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `timestamp` (timestamp)
      - `status` (text)
      
    - `exercise_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `walking_duration` (integer)
      - `calories` (integer)
      - `push_ups` (integer)
      - `sit_ups` (integer)
      - `day_number` (integer)
      
    - `ocd_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `start_time` (timestamp)
      - `level` (integer)
      - `day_number` (integer)
      - `created_at` (timestamp)
      - `weight` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Add policies for admin access
*/

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Create sleep records table
CREATE TABLE public.sleep_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    timestamp timestamp with time zone NOT NULL,
    status text NOT NULL CHECK (status IN ('bangun', 'sleep'))
);

-- Create exercise records table
CREATE TABLE public.exercise_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    date date NOT NULL,
    walking_duration integer NOT NULL,
    calories integer NOT NULL,
    push_ups integer NOT NULL,
    sit_ups integer NOT NULL,
    day_number integer NOT NULL
);

-- Create OCD records table
CREATE TABLE public.ocd_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('puasa', 'cheating')),
    start_time timestamp with time zone NOT NULL,
    level integer CHECK (level IN (1, 2, 3)),
    day_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    weight numeric
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocd_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admin can update all profiles"
    ON public.profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Sleep records policies
CREATE POLICY "Users can CRUD own sleep records"
    ON public.sleep_records FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all sleep records"
    ON public.sleep_records FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Exercise records policies
CREATE POLICY "Users can CRUD own exercise records"
    ON public.exercise_records FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all exercise records"
    ON public.exercise_records FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- OCD records policies
CREATE POLICY "Users can CRUD own OCD records"
    ON public.ocd_records FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all OCD records"
    ON public.ocd_records FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();