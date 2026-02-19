# 🎯 Step-by-Step SQL Execution Guide

## 📍 You Are Here
You have the SQL script ready. Now let's execute it in Supabase!

---

## 🚀 Method 1: One-Click Setup (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project from the list
3. You should see the project dashboard

### Step 2: Navigate to SQL Editor
1. Look at the left sidebar
2. Find and click: **"SQL Editor"**
3. Click: **"New query"** button (top right)

### Step 3: Copy the SQL Script
1. Open the file: `/SUPABASE_SETUP.sql`
2. Select ALL content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)

### Step 4: Paste and Execute
1. Click in the SQL Editor text area
2. Paste (Ctrl+V or Cmd+V)
3. Click the **"Run"** button (or press F5)
4. Wait 3-5 seconds for execution

### Step 5: Verify Success
You should see:
```
✅ Success. No rows returned
```

If you see errors, scroll to "Troubleshooting" section below.

---

## 🔍 Method 2: Section-by-Section (If Method 1 Fails)

Sometimes running the entire script at once causes issues. Execute in sections:

### Section 1: Create Tables
```sql
-- Copy and run THIS SECTION ONLY:

CREATE TABLE IF NOT EXISTS public.students (
    usn TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    branch TEXT NOT NULL,
    section TEXT NOT NULL,
    stream TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guides (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
    team_id TEXT PRIMARY KEY,
    leader_usn TEXT NOT NULL REFERENCES public.students(usn),
    guide_email TEXT NOT NULL REFERENCES public.guides(email),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id SERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    usn TEXT NOT NULL REFERENCES public.students(usn),
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, usn)
);
```

✅ Expected Result: `Success. No rows returned`

---

### Section 2: Create Indexes
```sql
-- Copy and run THIS SECTION ONLY:

CREATE INDEX IF NOT EXISTS idx_students_dob ON public.students(dob);
CREATE INDEX IF NOT EXISTS idx_team_members_usn ON public.team_members(usn);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
```

✅ Expected Result: `Success. No rows returned`

---

### Section 3: Enable RLS
```sql
-- Copy and run THIS SECTION ONLY:

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
```

✅ Expected Result: `Success. No rows returned`

---

### Section 4: Create RLS Policies
```sql
-- Copy and run THIS SECTION ONLY:

CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.guides FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for service role" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.team_members FOR SELECT USING (true);
```

✅ Expected Result: `Success. No rows returned`

---

### Section 5: Insert Students Data
```sql
-- Copy and run the FULL INSERT statement from SUPABASE_SETUP.sql
-- It starts with:
INSERT INTO public.students (usn, name, dob, branch, section, stream) VALUES
('4MC23CS001','Aarav Sharma','120305','CS','A','Computer Science Engineering'),
...
-- And ends with:
('4MC23RB010','Nikhil Das','090605','RB','J','Mechanical Engineering');
```

✅ Expected Result: `Success. 40 rows affected`

---

### Section 6: Insert Guides Data
```sql
-- Copy and run the FULL INSERT statement from SUPABASE_SETUP.sql
-- It starts with:
INSERT INTO public.guides (name, email, department) VALUES
('Dr. Ramesh Iyer','ramesh.iyer@mce.edu','Computer Science Engineering'),
...
-- And ends with:
('Dr. Ritu Sharma','ritu.sharma@mce.edu','Robotics & AI Engineering');
```

✅ Expected Result: `Success. 20 rows affected`

---

## ✅ Verification

After running all sections, verify everything worked:

```sql
-- Run this verification query:
SELECT 
    (SELECT COUNT(*) FROM students) as student_count,
    (SELECT COUNT(*) FROM guides) as guide_count,
    (SELECT COUNT(*) FROM teams) as team_count,
    (SELECT COUNT(*) FROM team_members) as member_count;
```

✅ Expected Result:
```
student_count: 40
guide_count: 20
team_count: 0
member_count: 0
```

---

## 🎯 Test Queries

### Query 1: View All Students
```sql
SELECT * FROM students ORDER BY usn LIMIT 10;
```

Should show 10 students starting with 4MC22...

---

### Query 2: Students by Stream
```sql
SELECT stream, COUNT(*) as count 
FROM students 
GROUP BY stream 
ORDER BY count DESC;
```

Expected:
```
Computer Science Engineering    20
Electronics Engineering         10
Mechanical Engineering           7
Civil Engineering                3
```

---

### Query 3: View All Guides
```sql
SELECT * FROM guides ORDER BY name LIMIT 10;
```

Should show 10 guides alphabetically.

---

### Query 4: Test Student Lookup
```sql
SELECT * FROM students WHERE usn = '4MC23CS001' AND dob = '120305';
```

Should return:
```
usn: 4MC23CS001
name: Aarav Sharma
dob: 120305
branch: CS
section: A
stream: Computer Science Engineering
```

---

## ❌ Troubleshooting

### Error: "relation already exists"

**Cause:** Tables already created

**Solution:** Either:
1. Drop and recreate:
```sql
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS students CASCADE;
```
Then run Section 1 again.

OR:

2. Skip to Section 5 (insert data only)

---

### Error: "duplicate key value violates unique constraint"

**Cause:** Data already inserted

**Solution:** Check if data exists:
```sql
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM guides;
```

If count > 0, skip insert sections.

---

### Error: "policy already exists"

**Cause:** RLS policies already created

**Solution:** This is OK! Continue to next section.

---

### Error: "permission denied"

**Cause:** RLS blocking insert

**Solution:** Make sure you're using the Supabase SQL Editor (which has admin access), not API calls.

---

### Error: "could not connect to server"

**Cause:** Network or Supabase issue

**Solution:**
1. Check internet connection
2. Refresh Supabase dashboard
3. Try again in a few seconds

---

## 🔍 Manual Verification Checklist

After SQL execution, manually verify:

```
□ Navigate to: Table Editor → students
  ├─ Should see 40 rows
  └─ Columns: usn, name, dob, branch, section, stream ✓

□ Navigate to: Table Editor → guides
  ├─ Should see 20 rows
  └─ Columns: id, name, email, department ✓

□ Navigate to: Table Editor → teams
  ├─ Should see 0 rows (initially empty)
  └─ Columns: team_id, leader_usn, guide_email ✓

□ Navigate to: Table Editor → team_members
  ├─ Should see 0 rows (initially empty)
  └─ Columns: id, team_id, usn, is_leader ✓

□ Navigate to: Authentication → Policies
  └─ All 4 tables should have RLS enabled ✓
```

---

## 🎯 Final Test: API Test

After setup, test your backend:

### Test 1: Health Check
Open in browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-fdaa97b0/health
```

Expected: `{"status":"ok"}`

---

### Test 2: Get Guides
Open in browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-fdaa97b0/guides
```

Should return JSON with 20 guides.

---

### Test 3: Login in Your App
1. Go to your app homepage
2. Enter: USN: `4MC23CS001`, DOB: `120305`
3. Should auto-fill: "Aarav Sharma"

---

## ✅ Success!

If all tests pass:
```
🎉 DATABASE SETUP COMPLETE!
✓ 40 students loaded
✓ 20 guides loaded
✓ Tables created
✓ RLS enabled
✓ Indexes created
✓ Backend connected

👉 Your app is ready to use!
```

---

## 📞 Still Stuck?

1. **Check logs:** Supabase Dashboard → Logs → Edge Functions
2. **Browser console:** Press F12 → Console tab
3. **Re-read:** `/TROUBLESHOOTING.md`
4. **Reset:** Drop all tables and start from Section 1

---

## 🎓 Pro Tips

1. **Save your queries:** Click "Save" in SQL Editor for quick access
2. **Use snippets:** Save frequently used queries
3. **Bookmark table editor:** Quick access to view data
4. **Keep logs open:** See real-time API calls

---

**Ready to test your app? Open it and try logging in! 🚀**
