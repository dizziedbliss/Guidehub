# 🔧 Database Error Fix

## ❌ Error Encountered:
```
Error inserting team: {
  code: "PGRST205",
  details: null,
  hint: "Perhaps you meant the table 'public.students'",
  message: "Could not find the table 'public.teams' in the schema cache"
}
```

## ✅ Solution:

The error occurs because the required database tables haven't been created yet. Your backend needs 4 tables:

1. **`students`** - Student information
2. **`guides`** - Faculty/guide information  
3. **`teams`** - Team registrations
4. **`team_members`** - Team membership tracking

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **"New Query"**

### 2. Run the Setup Script
1. Open the file `/DATABASE_SETUP.sql` (it's in your project root)
2. Copy ALL the SQL content
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

### 3. Verify Success
After running the script, you should see:
- ✅ 4 tables created
- ✅ 40 sample students inserted
- ✅ 20 sample guides inserted
- ✅ Indexes and security policies applied

---

## 🧪 Test the Fix:

### Option 1: Quick Check in Supabase
Run this query in SQL Editor:
```sql
-- Should return 40
SELECT COUNT(*) FROM public.students;

-- Should return 20
SELECT COUNT(*) FROM public.guides;

-- Should return 0 (no teams registered yet)
SELECT COUNT(*) FROM public.teams;
```

### Option 2: Test in Your App
1. Go to the login page
2. Try logging in with:
   - **USN:** `4MC23CS001`
   - **DOB:** `120305`
3. Add 5 team members
4. Select a guide
5. Submit the team

If successful, you'll see the team registered!

---

## 📊 Database Schema:

### `students` table:
- `usn` (primary key) - University Seat Number
- `name` - Student name
- `dob` - Date of birth (DDMMYY format)
- `branch` - Branch code (CS, CI, EE, etc.)
- `section` - Section (A, B, C, etc.)
- `stream` - Full stream name

### `guides` table:
- `email` (primary key) - Guide email
- `name` - Guide name
- `department` - Department name

### `teams` table:
- `team_id` (primary key) - Format: MCE25IP001
- `leader_usn` - Team leader USN (foreign key to students)
- `guide_email` - Selected guide (foreign key to guides)
- `registered_at` - Registration timestamp

### `team_members` table:
- `team_id` - Team ID (foreign key to teams)
- `usn` - Student USN (foreign key to students)
- `is_leader` - Boolean flag for team leader
- `joined_at` - Join timestamp

---

## 🎯 What This Fixes:

✅ **Login verification** - Checks if student exists and validates DOB
✅ **Team member verification** - Prevents duplicate registrations
✅ **inTeam flag** - Tracks which students are already in teams
✅ **Team registration** - Stores complete team data
✅ **Team ID generation** - Sequential numbering (MCE25IP001, MCE25IP002, etc.)

---

## 🔍 Troubleshooting:

### If you see "permission denied" errors:
The script includes Row Level Security (RLS) policies. If issues persist, you can temporarily disable RLS:
```sql
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
```

### If students already exist:
The script uses `ON CONFLICT DO NOTHING`, so it won't duplicate data.

### To reset everything:
```sql
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.guides CASCADE;
```
Then re-run the setup script.

---

## ✅ After Running the Script:

Your app should now work perfectly with:
- ✅ Student login verification
- ✅ Team member addition with duplicate checking
- ✅ Guide selection
- ✅ Team registration with auto-generated IDs
- ✅ inTeam flag tracking

**Run the SQL script now and your error will be fixed!** 🚀
