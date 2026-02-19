# 🎓 Team Registration System - Complete Setup

Welcome! This is a comprehensive guide to setting up your team registration web application with Supabase backend.

---

## 📚 Documentation Index

1. **`SETUP_GUIDE.md`** - ⭐ Start here! Step-by-step Supabase setup
2. **`SUPABASE_SETUP.sql`** - SQL script to create tables and insert data
3. **`TEST_CREDENTIALS.md`** - Login credentials for testing
4. **`ARCHITECTURE.md`** - System architecture and data flow diagrams
5. **`TROUBLESHOOTING.md`** - Common issues and solutions

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Supabase Database (3 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Copy all content from **`SUPABASE_SETUP.sql`**
3. Paste and click **"Run"**
4. ✅ Done! You now have:
   - 40 students across 4 streams
   - 20 faculty guides
   - Tables ready for team registrations

### Step 2: Test Your App (2 minutes)
1. Go to your app homepage (login page)
2. Test with credentials from **`TEST_CREDENTIALS.md`**:
   ```
   USN: 4MC23CS001
   DOB: 120305
   ```
3. Should auto-fill: "Aarav Sharma" ✅
4. Continue to add team members, select guide, and submit!

---

## 📊 What You Have

### **Frontend Features:**
- ✅ Login with USN + DOB validation
- ✅ Team member selection (1 leader + 5 members)
- ✅ Stream diversity validation (minimum 2 streams)
- ✅ Faculty guide selection with search
- ✅ Final confirmation page
- ✅ Application letter PDF generation
- ✅ Mobile-responsive design
- ✅ React Context for state management

### **Backend Features:**
- ✅ Student verification (USN + DOB)
- ✅ "Already in team" checking
- ✅ Faculty guides API
- ✅ Sequential team ID generation (MCE26IP001, MCE26IP002, ...)
- ✅ Team registration with proper database relationships
- ✅ Error handling and logging

### **Database:**
- ✅ 4 tables with proper foreign keys
- ✅ Row Level Security (RLS) enabled
- ✅ Performance indexes
- ✅ 40 students + 20 guides pre-loaded

---

## 🗂️ Database Schema

```
students          guides           teams            team_members
--------          ------           -----            ------------
usn (PK)         id (PK)          team_id (PK)     id (PK)
name             name             leader_usn       team_id (FK)
dob              email            guide_email      usn (FK)
branch           department       registered_at    is_leader
section                                            
stream                                             
```

---

## 🎯 Key Features

### **1. Stream-Based Validation**
Teams must have members from **at least 2 different streams**:
- **Computer Science Engineering** (CS, CI, CB)
- **Electronics Engineering** (EE, EC, VL)
- **Mechanical Engineering** (ME, RB)
- **Civil Engineering** (CV)

### **2. Automatic "In Team" Tracking**
- When a team registers, all 6 members are inserted into `team_members` table
- Next time they try to login: "Student is already registered in a team" ✅
- No duplicate registrations possible

### **3. Sequential Team IDs**
- Format: `MCE{YY}IP{###}`
- Example: `MCE26IP001`, `MCE26IP002`, ...
- Auto-increments each year

### **4. USN Format Validation**
- Format: `4MC{year}{branch}{roll}`
- Example: `4MC23CS001`
- Branch code extracted automatically

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/verify-student` | Login verification |
| GET | `/guides` | Fetch all faculty guides |
| POST | `/generate-team-id` | Get next sequential ID |
| POST | `/register-team` | Register team + members |
| GET | `/team/:teamId` | Get team details |

**Base URL:** `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-fdaa97b0`

---

## 🎨 Design System

Your app follows your college's design guidelines:

| Element | Value |
|---------|-------|
| Primary Text | #3b3b3b |
| Secondary Text | #999999 |
| Background | #e9e9e9 |
| Heading Font | Cormorant (serif) |
| Body Font | Cabin (sans-serif) |
| UI Font | Inter (sans-serif) |

---

## 📝 Data Summary

### Students by Stream:
- **Computer Science Engineering:** 20 students (CS, CI, CB)
- **Electronics Engineering:** 10 students (EE, EC, VL)
- **Mechanical Engineering:** 7 students (ME, RB)
- **Civil Engineering:** 3 students (CV)
- **Total:** 40 students

### Faculty Guides:
- **Engineering Departments:** 10 guides
- **Basic Sciences:** 6 guides (Physics, Chemistry, Math)
- **Specialized:** 4 guides
- **Total:** 20 guides

### Maximum Teams:
- **40 students ÷ 6 per team = 6 teams maximum**

---

## 🧪 Testing Scenarios

### ✅ **Valid Team Example:**
```
Leader: 4MC23CS001 (Aarav Sharma) - CS Stream
Member 1: 4MC23CI002 (Vivaan Reddy) - CS Stream
Member 2: 4MC22EE003 (Ishaan Nair) - EE Stream
Member 3: 4MC23EC004 (Aditya Rao) - EE Stream
Member 4: 4MC24CB005 (Reyansh Gupta) - CS Stream
Member 5: 4MC22ME006 (Arjun Patil) - ME Stream

Streams: CS (3) + EE (2) + ME (1) = 3 streams ✅
```

### ❌ **Invalid Team Example:**
```
All members from CS stream (CI, CB branches) ❌
Validation fails: "Team must have at least 2 streams"
```

---

## 🔧 Tech Stack

### **Frontend:**
- React 18.3.1
- React Router 7.13.0
- Tailwind CSS 4.1.12
- Lucide React (icons)

### **Backend:**
- Supabase Edge Functions (Deno)
- Hono web framework
- Supabase Database (PostgreSQL)
- KV Store (for counters)

### **State Management:**
- React Context API
- Custom hooks

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Backend uses Service Role Key (secure)
- ✅ Frontend uses Anon Key (safe to expose)
- ✅ Input validation on both frontend and backend
- ✅ Foreign key constraints prevent invalid data
- ✅ CORS configured for web access

---

## 📱 Mobile Support

- ✅ Fully responsive design
- ✅ Touch-friendly UI elements
- ✅ Mobile PDF generation with instructions
- ✅ Optimized for small screens

---

## 🎯 Workflow Overview

```
1. Login Page
   ├─ Enter USN + DOB
   ├─ Backend verifies credentials
   ├─ Checks if already in team
   └─ Auto-fills student details
   
2. Team Selection
   ├─ Add 5 team members (same process)
   ├─ Validates stream diversity
   └─ Shows real-time validation
   
3. Guide Selection
   ├─ Fetch all faculty guides
   ├─ Search by name
   ├─ Filter by department
   └─ Select one guide
   
4. Confirmation
   ├─ Generate team ID
   ├─ Review all details
   ├─ Submit to backend
   └─ Register in database
   
5. Application Letter
   ├─ Generate PDF
   ├─ Print/Save
   └─ Complete! 🎉
```

---

## 🆘 Getting Help

### If something doesn't work:

1. **Check:** `TROUBLESHOOTING.md` - Most common issues solved here
2. **Verify:** Run test queries in Supabase SQL Editor
3. **Inspect:** Browser console (F12) for error messages
4. **Review:** Supabase Edge Function logs

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just:

1. ✅ Run the SQL setup (if not done)
2. ✅ Open your app
3. ✅ Use test credentials
4. ✅ Register your first team!

**Your backend is now:**
- Connected to real Supabase database ✓
- Validating properly ✓
- Tracking team memberships ✓
- Generating sequential IDs ✓
- Ready for production ✓

---

## 📞 Support Documents

| Document | When to Use |
|----------|-------------|
| `SETUP_GUIDE.md` | First-time setup |
| `TEST_CREDENTIALS.md` | Need login credentials |
| `ARCHITECTURE.md` | Understand system design |
| `TROUBLESHOOTING.md` | Something not working |
| `SUPABASE_SETUP.sql` | Reset database |

---

**Happy Team Registration! 🚀**

Built with ❤️ for Malnad College of Engineering
