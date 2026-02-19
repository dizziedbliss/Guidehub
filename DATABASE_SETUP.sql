-- =============================================
-- INTERDISCIPLINARY PROJECT DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. STUDENTS TABLE
-- Stores all student information
-- =============================================
CREATE TABLE IF NOT EXISTS public.students (
    id BIGSERIAL PRIMARY KEY,
    usn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    branch TEXT NOT NULL,
    section TEXT NOT NULL,
    stream TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_usn ON public.students(usn);
CREATE INDEX IF NOT EXISTS idx_students_branch ON public.students(branch);
CREATE INDEX IF NOT EXISTS idx_students_stream ON public.students(stream);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read student data (needed for verification)
CREATE POLICY "Enable read access for all users" ON public.students
    FOR SELECT USING (true);

-- =============================================
-- 2. GUIDES TABLE
-- Stores guide/faculty information
-- =============================================
CREATE TABLE IF NOT EXISTS public.guides (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guides_email ON public.guides(email);
CREATE INDEX IF NOT EXISTS idx_guides_department ON public.guides(department);

-- Enable Row Level Security
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read guide data
CREATE POLICY "Enable read access for all users" ON public.guides
    FOR SELECT USING (true);

-- =============================================
-- 3. TEAMS TABLE
-- Stores team registrations
-- =============================================
CREATE TABLE IF NOT EXISTS public.teams (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT UNIQUE NOT NULL,
    leader_usn TEXT NOT NULL REFERENCES public.students(usn),
    guide_email TEXT NOT NULL REFERENCES public.guides(email),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON public.teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_usn ON public.teams(leader_usn);
CREATE INDEX IF NOT EXISTS idx_teams_guide_email ON public.teams(guide_email);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read team data
CREATE POLICY "Enable read access for all users" ON public.teams
    FOR SELECT USING (true);

-- Policy: Anyone can insert teams (for registration)
CREATE POLICY "Enable insert access for all users" ON public.teams
    FOR INSERT WITH CHECK (true);

-- =============================================
-- 4. TEAM_MEMBERS TABLE
-- Stores all team members (including leaders)
-- =============================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    usn TEXT NOT NULL REFERENCES public.students(usn),
    is_leader BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, usn)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_usn ON public.team_members(usn);
CREATE INDEX IF NOT EXISTS idx_team_members_is_leader ON public.team_members(is_leader);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read team member data
CREATE POLICY "Enable read access for all users" ON public.team_members
    FOR SELECT USING (true);

-- Policy: Anyone can insert team members (for registration)
CREATE POLICY "Enable insert access for all users" ON public.team_members
    FOR INSERT WITH CHECK (true);

-- =============================================
-- 5. INSERT SAMPLE STUDENT DATA
-- =============================================
INSERT INTO public.students (usn, name, dob, branch, section, stream) VALUES
  ('4MC23CS001', 'Aarav Sharma', '120305', 'CS', 'A', 'Computer Science Engineering'),
  ('4MC23CI002', 'Vivaan Reddy', '210705', 'CI', 'B', 'Computer Science Engineering'),
  ('4MC22EE003', 'Ishaan Nair', '051104', 'EE', 'C', 'Electronics Engineering'),
  ('4MC23EC004', 'Aditya Rao', '180105', 'EC', 'D', 'Electronics Engineering'),
  ('4MC24CB005', 'Reyansh Gupta', '300906', 'CB', 'E', 'Computer Science Engineering'),
  ('4MC22ME006', 'Arjun Patil', '250404', 'ME', 'F', 'Mechanical Engineering'),
  ('4MC23CI007', 'Karthik Iyer', '141205', 'CI', 'G', 'Computer Science Engineering'),
  ('4MC24CS008', 'Siddharth Jain', '070806', 'CS', 'H', 'Computer Science Engineering'),
  ('4MC22CV009', 'Harsh Vardhan', '190204', 'CV', 'I', 'Civil Engineering'),
  ('4MC23RB010', 'Nikhil Das', '090605', 'RB', 'J', 'Mechanical Engineering'),
  ('4MC23CI011', 'Ananya Shetty', '150505', 'CI', 'K', 'Computer Science Engineering'),
  ('4MC24CS012', 'Diya Menon', '221006', 'CS', 'L', 'Computer Science Engineering'),
  ('4MC23EC013', 'Sneha Kulkarni', '010105', 'EC', 'M', 'Electronics Engineering'),
  ('4MC22EE014', 'Kavya Nambiar', '170304', 'EE', 'N', 'Electronics Engineering'),
  ('4MC24CB015', 'Riya Verma', '290706', 'CB', 'O', 'Computer Science Engineering'),
  ('4MC23ME016', 'Meera Joshi', '111105', 'ME', 'P', 'Mechanical Engineering'),
  ('4MC23CI017', 'Aditi Rao', '060205', 'CI', 'Q', 'Computer Science Engineering'),
  ('4MC24RB018', 'Pooja S', '230806', 'RB', 'R', 'Mechanical Engineering'),
  ('4MC22CV019', 'Neha Reddy', '130904', 'CV', 'S', 'Civil Engineering'),
  ('4MC23VL020', 'Shruti Bhat', '040405', 'VL', 'T', 'Electronics Engineering'),
  ('4MC23CS021', 'Rahul Mishra', '160605', 'CS', 'A', 'Computer Science Engineering'),
  ('4MC24CI022', 'Manish Kumar', '271206', 'CI', 'B', 'Computer Science Engineering'),
  ('4MC22EE023', 'Tanmay Kulkarni', '031004', 'EE', 'C', 'Electronics Engineering'),
  ('4MC23EC024', 'Pranav Gowda', '080105', 'EC', 'D', 'Electronics Engineering'),
  ('4MC24ME025', 'Yash Patidar', '120206', 'ME', 'E', 'Mechanical Engineering'),
  ('4MC23RB026', 'Rohit Das', '190505', 'RB', 'F', 'Mechanical Engineering'),
  ('4MC22CS027', 'Saurabh Jain', '280704', 'CS', 'G', 'Computer Science Engineering'),
  ('4MC23CI028', 'Omkar Hegde', '090905', 'CI', 'H', 'Computer Science Engineering'),
  ('4MC24CB029', 'Varun Iyer', '140406', 'CB', 'I', 'Computer Science Engineering'),
  ('4MC23VL030', 'Akash Naik', '210305', 'VL', 'J', 'Electronics Engineering'),
  ('4MC23CS031', 'Priya Rao', '050605', 'CS', 'K', 'Computer Science Engineering'),
  ('4MC24CI032', 'Nandini Sharma', '170806', 'CI', 'L', 'Computer Science Engineering'),
  ('4MC22EE033', 'Aishwarya Patil', '290104', 'EE', 'M', 'Electronics Engineering'),
  ('4MC23EC034', 'Swathi Hegde', '101005', 'EC', 'N', 'Electronics Engineering'),
  ('4MC24CV035', 'Rachana N', '021206', 'CV', 'O', 'Civil Engineering'),
  ('4MC23ME036', 'Shreya Kulkarni', '200705', 'ME', 'P', 'Mechanical Engineering'),
  ('4MC22RB037', 'Tejas Rao', '260504', 'RB', 'Q', 'Mechanical Engineering'),
  ('4MC23CS038', 'Darshan Bhat', '140205', 'CS', 'R', 'Computer Science Engineering'),
  ('4MC24CI039', 'Vivek Iyer', '091106', 'CI', 'S', 'Computer Science Engineering'),
  ('4MC23CB040', 'Anirudh Menon', '180305', 'CB', 'T', 'Computer Science Engineering')
ON CONFLICT (usn) DO NOTHING;

-- =============================================
-- 6. INSERT SAMPLE GUIDE DATA
-- =============================================
INSERT INTO public.guides (name, email, department) VALUES
  ('Dr. Ramesh Iyer', 'ramesh.iyer@mce.edu', 'Computer Science Engineering'),
  ('Dr. Kavita Rao', 'kavita.rao@mce.edu', 'Artificial Intelligence and Machine Learning'),
  ('Dr. Anil Kumar', 'anil.kumar@mce.edu', 'Electrical & Electronics Engineering'),
  ('Dr. Snehalatha', 'snehalatha@mce.edu', 'Electronics & Communication Engineering'),
  ('Dr. Mohan Patil', 'mohan.patil@mce.edu', 'Mechanical Engineering'),
  ('Dr. Vivek Sharma', 'vivek.sharma@mce.edu', 'Civil Engineering'),
  ('Dr. Pradeep N', 'pradeep.n@mce.edu', 'Robotics & AI Engineering'),
  ('Dr. Meenakshi Rao', 'meenakshi.rao@mce.edu', 'VLSI Engineering'),
  ('Dr. Sunil Bhat', 'sunil.bhat@mce.edu', 'Computer Science & Business System'),
  ('Dr. Arpita Jain', 'arpita.jain@mce.edu', 'Artificial Intelligence and Machine Learning'),
  ('Dr. Kiran Hegde', 'kiran.hegde@mce.edu', 'Physics'),
  ('Dr. Lakshmi N', 'lakshmi.n@mce.edu', 'Chemistry'),
  ('Dr. Deepa Menon', 'deepa.menon@mce.edu', 'Mathematics'),
  ('Dr. Rahul Verma', 'rahul.verma@mce.edu', 'Physics'),
  ('Dr. Pooja Shetty', 'pooja.shetty@mce.edu', 'Chemistry'),
  ('Dr. Gopal Rao', 'gopal.rao@mce.edu', 'Mathematics'),
  ('Dr. Harish Kulkarni', 'harish.k@mce.edu', 'Computer Science Engineering'),
  ('Dr. Neha Patil', 'neha.patil@mce.edu', 'Artificial Intelligence and Machine Learning'),
  ('Dr. Shankar Iyer', 'shankar.iyer@mce.edu', 'Electrical & Electronics Engineering'),
  ('Dr. Ritu Sharma', 'ritu.sharma@mce.edu', 'Robotics & AI Engineering')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 7. VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- =============================================

-- Check students count
-- SELECT COUNT(*) as student_count FROM public.students;

-- Check guides count
-- SELECT COUNT(*) as guide_count FROM public.guides;

-- Check teams structure
-- SELECT * FROM public.teams LIMIT 5;

-- Check team_members structure
-- SELECT * FROM public.team_members LIMIT 5;

-- =============================================
-- SETUP COMPLETE! ✅
-- =============================================
-- Your database is now ready for the Interdisciplinary Project application.
-- 
-- Tables created:
-- 1. students (40 sample students)
-- 2. guides (20 sample guides)
-- 3. teams (for team registrations)
-- 4. team_members (for tracking team membership)
--
-- All tables have proper indexes and Row Level Security enabled.
-- =============================================
