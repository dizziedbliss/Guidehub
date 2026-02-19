# 🚀 Supabase Backend Setup Guide

## 📋 Overview
Your backend is now connected to Supabase with proper database tables instead of just the KV store. This gives you:
- ✅ Real database with foreign keys and constraints
- ✅ Automatic validation (no duplicate USNs, proper relationships)
- ✅ Better performance and scalability
- ✅ `inTeam` flag via `team_members` table (auto-managed)

---

## 🔧 Setup Steps

### **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

### **Step 2: Run the Setup SQL**
1. Open the file: `/SUPABASE_SETUP.sql`
2. Copy **ALL** the content
3. Paste into Supabase SQL Editor
4. Click **"Run"** button
5. ✅ You should see: "Success. No rows returned"

This will:
- ✅ Create 4 tables: `students`, `guides`, `teams`, `team_members`
- ✅ Insert 40 students with proper branch/stream mapping
- ✅ Insert 20 faculty guides
- ✅ Enable Row Level Security (RLS)
- ✅ Create performance indexes

---

## 📊 Database Schema

### **Table: `students`**
```
usn (PK)      | name             | dob      | branch | section | stream
4MC23CS001    | Aarav Sharma     | 120305   | CS     | A       | Computer Science Engineering
```

### **Table: `guides`**
```
id (PK) | name              | email                      | department
1       | Dr. Ramesh Iyer   | ramesh.iyer@mce.edu       | Computer Science Engineering
```

### **Table: `teams`**
```
team_id (PK)  | leader_usn   | guide_email              | registered_at
MCE26IP001    | 4MC23CS001   | ramesh.iyer@mce.edu     | 2026-02-18T...
```

### **Table: `team_members`**
```
id (PK) | team_id     | usn          | is_leader
1       | MCE26IP001  | 4MC23CS001   | true
2       | MCE26IP001  | 4MC23CI002   | false
```

---

## 🔗 API Endpoints (Backend)

### **1. Health Check**
```
GET /make-server-fdaa97b0/health
```

### **2. Verify Student (Login)**
```
POST /make-server-fdaa97b0/verify-student
Body: { "usn": "4MC23CS001", "dob": "120305" }

Response: {
  "success": true,
  "student": {
    "usn": "4MC23CS001",
    "name": "Aarav Sharma",
    "dob": "120305",
    "branch": "CS",
    "section": "A",
    "stream": "Computer Science Engineering"
  }
}
```
- ✅ Validates USN + DOB match
- ✅ Checks if already in a team (via `team_members` table)
- ✅ Returns full student details

### **3. Get All Guides**
```
GET /make-server-fdaa97b0/guides

Response: {
  "success": true,
  "guides": [
    {
      "name": "Dr. Ramesh Iyer",
      "email": "ramesh.iyer@mce.edu",
      "department": "Computer Science Engineering"
    }
  ]
}
```

### **4. Generate Team ID**
```
POST /make-server-fdaa97b0/generate-team-id

Response: {
  "success": true,
  "teamId": "MCE26IP001",
  "counter": 1
}
```
- Format: `MCE{YY}IP{###}`
- Sequential counter per year

### **5. Register Team**
```
POST /make-server-fdaa97b0/register-team
Body: {
  "teamId": "MCE26IP001",
  "teamLeader": { "usn": "4MC23CS001", ... },
  "teamMembers": [{ "usn": "4MC23CI002", ... }],
  "selectedGuide": { "email": "ramesh.iyer@mce.edu", ... }
}

Response: {
  "success": true,
  "message": "Team registered successfully",
  "teamId": "MCE26IP001"
}
```
- ✅ Inserts into `teams` table
- ✅ Inserts all members into `team_members` table
- ✅ Sets `is_leader = true` for team leader
- ✅ Also stores in KV for backup

### **6. Get Team by ID**
```
GET /make-server-fdaa97b0/team/:teamId

Response: {
  "success": true,
  "team": { ... }
}
```

---

## 🎯 How It Works

### **Login Flow:**
1. User enters USN + DOB
2. Backend calls `/verify-student`
3. Supabase checks:
   - Does student exist? ✓
   - Does DOB match? ✓
   - Is student in `team_members` table? ✗ (if yes, reject)
4. Returns student details (auto-fills form)

### **Guide Selection Flow:**
1. Frontend calls `/guides`
2. Supabase returns all guides from `guides` table
3. Display with search/filter functionality

### **Team Registration Flow:**
1. Frontend validates team (5 members + 1 leader, 2+ streams)
2. Calls `/generate-team-id` → Gets `MCE26IP001`
3. Calls `/register-team` with all data
4. Backend:
   - Inserts into `teams` table
   - Inserts 6 rows into `team_members` table
   - Marks leader with `is_leader = true`
5. ✅ All members are now "in a team" (automatic via foreign key)

---

## 🔍 Verification

After running the SQL, test these queries in Supabase SQL Editor:

```sql
-- Count students by stream
SELECT stream, COUNT(*) FROM students GROUP BY stream;

-- Expected:
-- Computer Science Engineering: 20
-- Electronics Engineering: 10
-- Mechanical Engineering: 7
-- Civil Engineering: 3

-- View all guides
SELECT * FROM guides ORDER BY name;

-- Test a student login
SELECT * FROM students WHERE usn = '4MC23CS001' AND dob = '120305';
```

---

## 🎨 Stream Mapping

The backend automatically maps branches to streams:

| Branches | Stream |
|----------|--------|
| CS, CI, CB | Computer Science Engineering |
| EE, EC, VL | Electronics Engineering |
| ME, RB | Mechanical Engineering |
| CV | Civil Engineering |

This is already handled in your data! ✅

---

## ✅ You're All Set!

Your backend is now fully connected to Supabase with:
- ✅ 40 students across 4 streams
- ✅ 20 faculty guides
- ✅ Automatic `inTeam` tracking via `team_members` table
- ✅ Sequential team ID generation
- ✅ Full validation and error handling

**Next:** Test your app by logging in with any student USN + DOB! 🚀
