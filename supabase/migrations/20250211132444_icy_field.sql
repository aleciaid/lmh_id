/*
  # Add Changelog Feature

  1. New Tables
    - `changelogs`
      - `id` (uuid, primary key)
      - `type` (text) - bug/feature/performance
      - `version` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid) - references profiles(id)

  2. Security
    - Enable RLS
    - Add policies for:
      - All users can read
      - Only admins can write
*/

-- Create changelog table
CREATE TABLE public.changelogs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('bug', 'feature', 'performance')),
    version text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;

-- Everyone can read changelogs
CREATE POLICY "Everyone can view changelogs" 
    ON public.changelogs FOR SELECT 
    USING (true);

-- Only admins can insert changelogs
CREATE POLICY "Only admins can insert changelogs" 
    ON public.changelogs FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Only admins can update changelogs
CREATE POLICY "Only admins can update changelogs" 
    ON public.changelogs FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Only admins can delete changelogs
CREATE POLICY "Only admins can delete changelogs" 
    ON public.changelogs FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND role = 'admin'
    ));

-- Insert dummy data
INSERT INTO public.changelogs (type, version, description, created_at)
VALUES
    ('feature', 'v1.0.7', '# Major Updates\n\n- Added new dashboard interface\n- Implemented real-time notifications\n- Enhanced user profile management\n\n## Minor Changes\n\n- Updated color scheme\n- Fixed responsive layout issues\n- Improved loading performance', NOW() - INTERVAL '5 days'),
    ('bug', 'v1.0.7', '## Bug Fixes\n\n- Fixed authentication token expiration issue\n- Resolved data synchronization problems\n- Fixed mobile navigation menu\n\n### Technical Details\n\n- Updated dependencies\n- Optimized database queries', NOW() - INTERVAL '4 days'),
    ('performance', 'v1.0.7', '## Performance Improvements\n\n- Reduced initial load time by 40%\n- Optimized image loading and caching\n- Improved database query performance\n\n### Metrics\n\n- Page load: 1.2s → 0.7s\n- API response: 300ms → 150ms', NOW() - INTERVAL '3 days');