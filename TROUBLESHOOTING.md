# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Issue 1: "Failed to verify student" error

**Symptoms:**
- Login page shows error after entering USN + DOB
- Console shows: `Student verification error`

**Possible Causes:**
1. Database tables not created
2. Data not inserted
3. Wrong USN or DOB format

**Solutions:**

### ✅ Solution A: Verify Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT * FROM students LIMIT 5;
SELECT * FROM guides LIMIT 5;
```
If you get "relation does not exist" error:
- Go back to `/SUPABASE_SETUP.sql`
- Copy the CREATE TABLE section
- Run it in SQL Editor

### ✅ Solution B: Verify Data Exists
```sql
-- Check if students are inserted
SELECT COUNT(*) FROM students;
-- Should return: 40

-- Check specific student
SELECT * FROM students WHERE usn = '4MC23CS001';
-- Should return: Aarav Sharma
```
If count is 0:
- Copy the INSERT statements from `/SUPABASE_SETUP.sql`
- Run them in SQL Editor

### ✅ Solution C: Check RLS Policies
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
All tables should have `rowsecurity = true`

If policies are missing:
- Copy the RLS section from `/SUPABASE_SETUP.sql`
- Run it in SQL Editor

---

## ❌ Issue 2: "Failed to fetch guides" error

**Symptoms:**
- Guide selection page is empty
- Console shows error fetching guides

**Solutions:**

### ✅ Solution: Check Guides Table
```sql
-- Run in Supabase SQL Editor
SELECT * FROM guides ORDER BY name;
```
Should return 20 guides.

If empty:
- Copy the guides INSERT statements
- Run in SQL Editor

---

## ❌ Issue 3: "Student is already registered in a team"

**Symptoms:**
- Can't login with a USN that was previously used
- This is **expected behavior** after team registration

**Solutions:**

### ✅ Solution A: Use Different Student
- Use a different USN from `/TEST_CREDENTIALS.md`

### ✅ Solution B: Reset Team Registration (Development Only)
```sql
-- WARNING: This deletes all team registrations!
-- Only use for testing

DELETE FROM team_members WHERE usn = '4MC23CS001';
DELETE FROM teams WHERE leader_usn = '4MC23CS001';
```

### ✅ Solution C: Reset ALL Teams (Development Only)
```sql
-- WARNING: This deletes ALL teams!
TRUNCATE TABLE team_members CASCADE;
TRUNCATE TABLE teams CASCADE;
```

---

## ❌ Issue 4: Team registration fails

**Symptoms:**
- "Failed to register team" error
- Team ID generated but not saved

**Possible Causes:**
1. Foreign key constraint violation
2. USN doesn't exist in students table
3. Guide email doesn't exist in guides table

**Solutions:**

### ✅ Solution A: Verify All USNs Exist
```sql
-- Check if all team member USNs exist
SELECT usn, name FROM students 
WHERE usn IN ('4MC23CS001', '4MC23CI002', ...);
```

### ✅ Solution B: Verify Guide Email Exists
```sql
-- Check if guide email exists
SELECT * FROM guides WHERE email = 'ramesh.iyer@mce.edu';
```

### ✅ Solution C: Check Backend Logs
- Open browser DevTools (F12)
- Go to Console tab
- Look for detailed error messages

---

## ❌ Issue 5: "Invalid USN or DOB" but credentials are correct

**Symptoms:**
- Using correct USN + DOB from database
- Still getting invalid credentials error

**Possible Causes:**
1. DOB format mismatch (spaces, dashes)
2. USN case sensitivity

**Solutions:**

### ✅ Solution A: Verify Exact Format
```sql
-- Check exact format in database
SELECT usn, dob FROM students WHERE usn = '4MC23CS001';
```
DOB should be exactly: `120305` (no spaces, dashes)

### ✅ Solution B: Update DOB Format
If your DOB has wrong format:
```sql
-- Fix DOB format (remove dashes/spaces)
UPDATE students 
SET dob = REPLACE(REPLACE(dob, '-', ''), '/', '') 
WHERE usn = '4MC23CS001';
```

---

## ❌ Issue 6: Backend endpoint returns 500 error

**Symptoms:**
- All API calls fail
- Console shows: `500 Internal Server Error`

**Solutions:**

### ✅ Solution A: Check Environment Variables
1. Go to Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Verify these exist:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

### ✅ Solution B: Check Backend Logs
1. Go to Supabase Dashboard
2. Edge Functions → Logs
3. Look for error messages

### ✅ Solution C: Test Health Endpoint
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-fdaa97b0/health
```
Should return: `{"status":"ok"}`

---

## ❌ Issue 7: CORS error in browser console

**Symptoms:**
- Browser console shows: `CORS policy blocked`
- Requests fail with network error

**Solutions:**

### ✅ Solution: CORS is already configured
The backend has CORS enabled for all origins (`*`).

If still seeing errors:
1. Check if you're using HTTPS (not HTTP)
2. Verify backend URL is correct
3. Check browser console for exact error message

---

## ❌ Issue 8: Team ID not generating

**Symptoms:**
- Team registration fails
- No team ID shown

**Solutions:**

### ✅ Solution: Check KV Store
The team counter uses KV store. Verify it's accessible:
```typescript
// Test in backend
const counter = await kv.get('team_counter_26');
console.log('Counter:', counter);
```

If KV store is unavailable, the backend will auto-create it starting from 1.

---

## ❌ Issue 9: "Branch" or "Stream" fields are null

**Symptoms:**
- Student data is missing branch or stream
- Validation fails

**Solutions:**

### ✅ Solution: Update Students Table
All students should have branch and stream:
```sql
-- Check for null values
SELECT usn, name, branch, stream 
FROM students 
WHERE branch IS NULL OR stream IS NULL;
```

If any are null, re-run the INSERT statements from `/SUPABASE_SETUP.sql`

---

## ❌ Issue 10: Application Letter PDF not generating

**Symptoms:**
- Print dialog doesn't open
- PDF is blank

**This is a different issue** - see mobile printing guide in the app.

---

## 🔍 Debugging Checklist

Before asking for help, verify:

- [ ] ✅ Supabase tables created (students, guides, teams, team_members)
- [ ] ✅ Data inserted (40 students, 20 guides)
- [ ] ✅ RLS policies enabled and configured
- [ ] ✅ Environment variables set in Supabase
- [ ] ✅ Backend health endpoint returns "ok"
- [ ] ✅ Browser console checked for errors
- [ ] ✅ Supabase Edge Function logs checked
- [ ] ✅ Using correct USN + DOB format from test credentials

---

## 📞 Still Having Issues?

### Step 1: Check Backend Logs
1. Supabase Dashboard → Edge Functions → Logs
2. Look for detailed error messages

### Step 2: Check Browser Console
1. Press F12 → Console tab
2. Look for red error messages

### Step 3: Test API Endpoints Manually

**Test Health:**
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-fdaa97b0/health
```

**Test Student Verification:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-fdaa97b0/verify-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"usn":"4MC23CS001","dob":"120305"}'
```

**Test Guides:**
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-fdaa97b0/guides \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Tables don't exist | Run CREATE TABLE statements |
| No data | Run INSERT statements |
| RLS blocking access | Run RLS policy statements |
| CORS error | Already configured (check URL) |
| 500 error | Check environment variables |
| "Already in team" | Use different USN or reset |
| Invalid credentials | Verify exact USN + DOB format |

---

**Most issues are solved by:**
1. Re-running `/SUPABASE_SETUP.sql` completely
2. Checking browser console for errors
3. Verifying environment variables are set

🎉 **Happy Debugging!**
