-- ============================================
-- CREATE TABLES
-- ============================================

-- KV Store table (for team counter and other key-value data)
CREATE TABLE IF NOT EXISTS public.kv_store_fdaa97b0 (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
    usn TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    branch TEXT NOT NULL,
    section TEXT NOT NULL,
    stream TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guides table
CREATE TABLE IF NOT EXISTS public.guides (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    team_id TEXT PRIMARY KEY,
    leader_usn TEXT NOT NULL REFERENCES public.students(usn),
    guide_email TEXT NOT NULL REFERENCES public.guides(email),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table (junction table)
CREATE TABLE IF NOT EXISTS public.team_members (
    id SERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    usn TEXT NOT NULL REFERENCES public.students(usn),
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, usn)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_dob ON public.students(dob);
CREATE INDEX IF NOT EXISTS idx_team_members_usn ON public.team_members(usn);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- ============================================
-- STEP 2: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (using service role key from backend)
CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.guides FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.team_members FOR SELECT USING (true);

-- ============================================
-- STEP 3: Insert Data
-- ============================================

-- Insert Students Data (with branch and stream auto-calculated)
INSERT INTO public.students (usn, name, dob, branch, section, stream) VALUES
-- Computer Science Engineering (CS, CI)
('4MC23CS001','Aarav Sharma','120305','CS','A','Computer Science Engineering'),
('4MC23CI002','Vivaan Reddy','210705','CI','B','Computer Science Engineering'),
('4MC23CI007','Karthik Iyer','141205','CI','G','Computer Science Engineering'),
('4MC24CS008','Siddharth Jain','070806','CS','H','Computer Science Engineering'),
('4MC23CI011','Ananya Shetty','150505','CI','K','Computer Science Engineering'),
('4MC24CS012','Diya Menon','221006','CS','L','Computer Science Engineering'),
('4MC23CI017','Aditi Rao','060205','CI','Q','Computer Science Engineering'),
('4MC23CS021','Rahul Mishra','160605','CS','A','Computer Science Engineering'),
('4MC24CI022','Manish Kumar','271206','CI','B','Computer Science Engineering'),
('4MC22CS027','Saurabh Jain','280704','CS','G','Computer Science Engineering'),
('4MC23CI028','Omkar Hegde','090905','CI','H','Computer Science Engineering'),
('4MC23CS031','Priya Rao','050605','CS','K','Computer Science Engineering'),
('4MC24CI032','Nandini Sharma','170806','CI','L','Computer Science Engineering'),
('4MC22RB037','Tejas Rao','260504','RB','Q','Mechanical Engineering'),
('4MC23CS038','Darshan Bhat','140205','CS','R','Computer Science Engineering'),
('4MC24CI039','Vivek Iyer','091106','CI','S','Computer Science Engineering'),

-- Computer Science & Business Systems (CB)
('4MC24CB005','Reyansh Gupta','300906','CB','E','Computer Science Engineering'),
('4MC24CB015','Riya Verma','290706','CB','O','Computer Science Engineering'),
('4MC24CB029','Varun Iyer','140406','CB','I','Computer Science Engineering'),
('4MC23CB040','Anirudh Menon','180305','CB','T','Computer Science Engineering'),

-- Electronics Engineering (EE, EC)
('4MC22EE003','Ishaan Nair','051104','EE','C','Electronics Engineering'),
('4MC23EC004','Aditya Rao','180105','EC','D','Electronics Engineering'),
('4MC23EC013','Sneha Kulkarni','010105','EC','M','Electronics Engineering'),
('4MC22EE014','Kavya Nambiar','170304','EE','N','Electronics Engineering'),
('4MC22EE023','Tanmay Kulkarni','031004','EE','C','Electronics Engineering'),
('4MC23EC024','Pranav Gowda','080105','EC','D','Electronics Engineering'),
('4MC22EE033','Aishwarya Patil','290104','EE','M','Electronics Engineering'),
('4MC23EC034','Swathi Hegde','101005','EC','N','Electronics Engineering'),

-- VLSI Engineering (VL)
('4MC23VL020','Shruti Bhat','040405','VL','T','Electronics Engineering'),
('4MC23VL030','Akash Naik','210305','VL','J','Electronics Engineering'),

-- Mechanical Engineering (ME, RB)
('4MC22ME006','Arjun Patil','250404','ME','F','Mechanical Engineering'),
('4MC23ME016','Meera Joshi','111105','ME','P','Mechanical Engineering'),
('4MC24ME025','Yash Patidar','120206','ME','E','Mechanical Engineering'),
('4MC23RB026','Rohit Das','190505','RB','F','Mechanical Engineering'),
('4MC23ME036','Shreya Kulkarni','200705','ME','P','Mechanical Engineering'),
('4MC24RB018','Pooja S','230806','RB','R','Mechanical Engineering'),

-- Civil Engineering (CV)
('4MC22CV009','Harsh Vardhan','190204','CV','I','Civil Engineering'),
('4MC22CV019','Neha Reddy','130904','CV','S','Civil Engineering'),
('4MC24CV035','Rachana N','021206','CV','O','Civil Engineering'),

-- Robotics & AI (RB - mapped to Mechanical for stream diversity)
('4MC23RB010','Nikhil Das','090605','RB','J','Mechanical Engineering');

-- Insert Faculty Guides Data
INSERT INTO public.guides (name, email, department) VALUES
('Dr. Ramesh Iyer','ramesh.iyer@mce.edu','Computer Science Engineering'),
('Dr. Kavita Rao','kavita.rao@mce.edu','Artificial Intelligence and Machine Learning'),
('Dr. Anil Kumar','anil.kumar@mce.edu','Electrical & Electronics Engineering'),
('Dr. Snehalatha','snehalatha@mce.edu','Electronics & Communication Engineering'),
('Dr. Mohan Patil','mohan.patil@mce.edu','Mechanical Engineering'),
('Dr. Vivek Sharma','vivek.sharma@mce.edu','Civil Engineering'),
('Dr. Pradeep N','pradeep.n@mce.edu','Robotics & AI Engineering'),
('Dr. Meenakshi Rao','meenakshi.rao@mce.edu','VLSI Engineering'),
('Dr. Sunil Bhat','sunil.bhat@mce.edu','Computer Science & Business System'),
('Dr. Arpita Jain','arpita.jain@mce.edu','Artificial Intelligence and Machine Learning'),

('Dr. Kiran Hegde','kiran.hegde@mce.edu','Physics'),
('Dr. Lakshmi N','lakshmi.n@mce.edu','Chemistry'),
('Dr. Deepa Menon','deepa.menon@mce.edu','Mathematics'),
('Dr. Rahul Verma','rahul.verma@mce.edu','Physics'),
('Dr. Pooja Shetty','pooja.shetty@mce.edu','Chemistry'),
('Dr. Gopal Rao','gopal.rao@mce.edu','Mathematics'),
('Dr. Harish Kulkarni','harish.k@mce.edu','Computer Science Engineering'),
('Dr. Neha Patil','neha.patil@mce.edu','Artificial Intelligence and Machine Learning'),
('Dr. Shankar Iyer','shankar.iyer@mce.edu','Electrical & Electronics Engineering'),
('Dr. Ritu Sharma','ritu.sharma@mce.edu','Robotics & AI Engineering');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count students by stream
SELECT stream, COUNT(*) as count 
FROM public.students 
GROUP BY stream 
ORDER BY count DESC;

-- Count students by branch
SELECT branch, COUNT(*) as count 
FROM public.students 
GROUP BY branch 
ORDER BY count DESC;

-- List all guides by department
SELECT department, COUNT(*) as count 
FROM public.guides 
GROUP BY department 
ORDER BY count DESC;

-- View all students
SELECT * FROM public.students ORDER BY usn;

-- View all guides
SELECT * FROM public.guides ORDER BY name;

-- ============================================
-- SETUP COMPLETE! 
-- ============================================
-- Your backend is now ready to:
-- 1. Verify student login (USN + DOB)
-- 2. Fetch all faculty guides
-- 3. Register teams
-- 4. Track team members
-- ============================================