# ⚡ Quick Reference Card

## 🚀 Setup in 3 Steps

```bash
1. Supabase Dashboard → SQL Editor
2. Paste content from SUPABASE_SETUP.sql
3. Click "Run" → Done! ✅
```

---

## 🔑 Test Login

```
USN: 4MC23CS001
DOB: 120305
Name: Aarav Sharma
```

---

## 📊 Database Tables

| Table | Records | Purpose |
|-------|---------|---------|
| students | 40 | Student data with USN, DOB, stream |
| guides | 20 | Faculty guides |
| teams | 0+ | Team registrations |
| team_members | 0+ | Junction table (6 per team) |

---

## 🎯 Validation Rules

✅ **Valid Team:**
- 1 leader + 5 members = 6 total
- >= 2 different streams
- All valid USNs
- 1 faculty guide

❌ **Invalid Team:**
- < 6 members
- Only 1 stream
- Duplicate USNs
- Member already in another team

---

## 🌊 Stream Mapping

| Stream | Branches |
|--------|----------|
| Computer Science Engineering | CS, CI, CB |
| Electronics Engineering | EE, EC, VL |
| Mechanical Engineering | ME, RB |
| Civil Engineering | CV |

---

## 📡 API Endpoints

**Base:** `https://{projectId}.supabase.co/functions/v1/make-server-fdaa97b0`

```
POST /verify-student     - Login
GET  /guides             - Fetch guides
POST /generate-team-id   - Get team ID
POST /register-team      - Submit team
GET  /team/:teamId       - Get team
```

---

## 🔧 Common Fixes

| Problem | Solution |
|---------|----------|
| "Student not found" | Re-run SQL inserts |
| "Already in team" | Use different USN or reset |
| "Failed to register" | Check backend logs |
| Empty guide list | Re-run guide inserts |
| CORS error | Already configured (check URL) |

---

## 📝 USN Format

```
4MC23CS001
│││││└┴┴─── Roll number (001-999)
││││└────── Branch code (CS, EE, ME, etc.)
│││└─────── Year (23 = 2023)
││└──────── College code (MC = Malnad College)
│└───────── University code (4 = VTU)
└────────── Prefix
```

---

## 📅 DOB Format

```
120305
││││└┴─── Year (05 = 2005)
││└┴───── Month (03 = March)
└┴─────── Day (12)
```

---

## 🎨 Color Palette

```css
--primary-text:    #3b3b3b
--secondary-text:  #999999
--background:      #e9e9e9
--white:           #ffffff
--black:           #171717
```

---

## 📱 Fonts

```css
Headings:   Cormorant (serif)
Body:       Cabin (sans-serif)
UI/Buttons: Inter (sans-serif)
```

---

## 🔍 Verification Queries

```sql
-- Check students count
SELECT COUNT(*) FROM students;
-- Expected: 40

-- Check guides count
SELECT COUNT(*) FROM guides;
-- Expected: 20

-- View streams distribution
SELECT stream, COUNT(*) 
FROM students 
GROUP BY stream;

-- Check if USN in team
SELECT * FROM team_members 
WHERE usn = '4MC23CS001';
```

---

## 🎯 Team ID Format

```
MCE26IP001
│││││││└┴┴─── Sequential number (001-999)
││││││└────── "IP" = Ideathon Project
│││││└─────── Year (26 = 2026)
│││└┴──────── College code (MCE)
│││
│││  Next IDs:
│││  MCE26IP002
│││  MCE26IP003
└┴┴  ...
```

---

## 📚 Documentation Map

```
README.md              ← Overview
├─ SETUP_GUIDE.md      ← Setup instructions
├─ SUPABASE_SETUP.sql  ← Database script
├─ TEST_CREDENTIALS.md ← Login data
├─ ARCHITECTURE.md     ← System design
└─ TROUBLESHOOTING.md  ← Fix issues
```

---

## ✅ Pre-Launch Checklist

- [ ] SQL script executed in Supabase
- [ ] 40 students inserted
- [ ] 20 guides inserted
- [ ] RLS policies enabled
- [ ] Test login works
- [ ] Team registration works
- [ ] PDF generation works
- [ ] Mobile responsive tested

---

## 🆘 Emergency Reset

```sql
-- Reset all teams (DEV ONLY!)
TRUNCATE TABLE team_members CASCADE;
TRUNCATE TABLE teams CASCADE;

-- Reset counter in backend
-- DELETE team_counter_26 from KV store
```

---

## 📊 Data Statistics

```
Total Students:  40
├─ CS Stream:    20 (50%)
├─ EE Stream:    10 (25%)
├─ ME Stream:     7 (17.5%)
└─ CV Stream:     3 (7.5%)

Total Guides:    20
Max Teams:        6 (40÷6)
```

---

## 🎓 Example Team

```
Team: MCE26IP001
Leader: Aarav Sharma (4MC23CS001) - CS
Members:
  1. Vivaan Reddy (4MC23CI002) - CS
  2. Ishaan Nair (4MC22EE003) - EE
  3. Aditya Rao (4MC23EC004) - EE
  4. Reyansh Gupta (4MC24CB005) - CS
  5. Arjun Patil (4MC22ME006) - ME
  
Guide: Dr. Ramesh Iyer (ramesh.iyer@mce.edu)
Streams: CS (3) + EE (2) + ME (1) = 3 ✅
```

---

## ⚡ Speed Tips

1. **Use browser autofill** for faster testing
2. **Bookmark test credentials** page
3. **Keep SQL editor open** for quick queries
4. **Use F12 DevTools** for debugging
5. **Check Edge Function logs** for backend errors

---

## 🎯 Success Criteria

✅ **Your app is working if:**
- Login shows student name automatically
- "Already in team" error prevents duplicates
- Stream validation rejects single-stream teams
- Team ID increments sequentially
- PDF generates correctly
- Mobile UI is responsive

---

**Print this page for quick reference! 📄**
