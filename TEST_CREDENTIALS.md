# 🔐 Test Login Credentials

Use these credentials to test your app after setting up Supabase:

## 👤 Students (USN + DOB Format: DDMMYY)

### Computer Science Engineering
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC23CS001 | Aarav Sharma | 120305 | A |
| 4MC24CS008 | Siddharth Jain | 070806 | H |
| 4MC24CS012 | Diya Menon | 221006 | L |
| 4MC23CS021 | Rahul Mishra | 160605 | A |
| 4MC22CS027 | Saurabh Jain | 280704 | G |
| 4MC23CS031 | Priya Rao | 050605 | K |
| 4MC23CS038 | Darshan Bhat | 140205 | R |

### Artificial Intelligence (CI branch)
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC23CI002 | Vivaan Reddy | 210705 | B |
| 4MC23CI007 | Karthik Iyer | 141205 | G |
| 4MC23CI011 | Ananya Shetty | 150505 | K |
| 4MC23CI017 | Aditi Rao | 060205 | Q |
| 4MC24CI022 | Manish Kumar | 271206 | B |
| 4MC23CI028 | Omkar Hegde | 090905 | H |
| 4MC24CI032 | Nandini Sharma | 170806 | L |
| 4MC24CI039 | Vivek Iyer | 091106 | S |

### Electronics Engineering
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC22EE003 | Ishaan Nair | 051104 | C |
| 4MC23EC004 | Aditya Rao | 180105 | D |
| 4MC23EC013 | Sneha Kulkarni | 010105 | M |
| 4MC22EE014 | Kavya Nambiar | 170304 | N |
| 4MC23VL020 | Shruti Bhat | 040405 | T |
| 4MC22EE023 | Tanmay Kulkarni | 031004 | C |
| 4MC23EC024 | Pranav Gowda | 080105 | D |
| 4MC23VL030 | Akash Naik | 210305 | J |

### Mechanical Engineering
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC22ME006 | Arjun Patil | 250404 | F |
| 4MC23RB010 | Nikhil Das | 090605 | J |
| 4MC23ME016 | Meera Joshi | 111105 | P |
| 4MC24RB018 | Pooja S | 230806 | R |
| 4MC24ME025 | Yash Patidar | 120206 | E |
| 4MC23RB026 | Rohit Das | 190505 | F |

### Civil Engineering
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC22CV009 | Harsh Vardhan | 190204 | I |
| 4MC22CV019 | Neha Reddy | 130904 | S |
| 4MC24CV035 | Rachana N | 021206 | O |

### Computer Science & Business (CB)
| USN | Name | DOB | Section |
|-----|------|-----|---------|
| 4MC24CB005 | Reyansh Gupta | 300906 | E |
| 4MC24CB015 | Riya Verma | 290706 | O |
| 4MC24CB029 | Varun Iyer | 140406 | I |
| 4MC23CB040 | Anirudh Menon | 180305 | T |

---

## 📝 Testing Scenarios

### ✅ Valid Team Formation (2 Streams)
**Team 1: CS + EE (Valid)**
- Leader: 4MC23CS001 (Aarav Sharma) - CS
- Member 1: 4MC23CI002 (Vivaan Reddy) - CI
- Member 2: 4MC22EE003 (Ishaan Nair) - EE
- Member 3: 4MC23EC004 (Aditya Rao) - EC
- Member 4: 4MC24CB005 (Reyansh Gupta) - CB
- Member 5: 4MC22ME006 (Arjun Patil) - ME

**Streams:** Computer Science (CS, CI, CB) + Electronics (EE, EC) + Mechanical (ME) ✅

### ✅ Valid Team Formation (2 Streams - Minimum)
**Team 2: CS + ME (Valid)**
- Leader: 4MC24CS008 (Siddharth Jain) - CS
- Member 1: 4MC23CI007 (Karthik Iyer) - CI
- Member 2: 4MC22CV009 (Harsh Vardhan) - CV
- Member 3: 4MC23RB010 (Nikhil Das) - RB
- Member 4: 4MC23CI011 (Ananya Shetty) - CI
- Member 5: 4MC24CS012 (Diya Menon) - CS

**Streams:** Computer Science (CS, CI) + Civil (CV) + Mechanical (RB) ✅

### ❌ Invalid Team Formation (1 Stream Only)
**Team 3: All CS (Invalid)**
- Leader: 4MC23CS021 (Rahul Mishra) - CS
- Member 1: 4MC24CI022 (Manish Kumar) - CI
- Member 2: 4MC22CS027 (Saurabh Jain) - CS
- Member 3: 4MC23CI028 (Omkar Hegde) - CI
- Member 4: 4MC24CB029 (Varun Iyer) - CB
- Member 5: 4MC23VL030 (Akash Naik) - VL

**Streams:** Only Computer Science (CS, CI, CB) ❌ (Should fail validation)

### ✅ Testing "Already in Team" Scenario
1. Register Team 1 successfully
2. Try to login again with: 4MC23CS001 (Aarav Sharma)
3. Should get error: "Student is already registered in a team" ✅

---

## 🧪 Quick Test Checklist

- [ ] Login with valid USN + DOB → Shows student name ✓
- [ ] Login with wrong DOB → Shows "Invalid USN or DOB" ✓
- [ ] Select 5 team members → Validates stream diversity ✓
- [ ] Select faculty guide → Displays all 20 guides ✓
- [ ] Submit team → Gets team ID (e.g., MCE26IP001) ✓
- [ ] Try to login with same USN → "Already in team" error ✓
- [ ] Generate application letter PDF ✓

---

## 🎯 Expected Behavior

### Login Page
- Enter: `4MC23CS001` + `120305`
- Result: Auto-fills "Aarav Sharma" ✅

### Team Selection
- Add 5 members from different streams
- Validation passes if >= 2 streams ✅

### Guide Selection
- See all 20 faculty guides
- Search by name or filter by department ✅

### Final Confirmation
- Team ID: `MCE26IP001` (auto-generated)
- Can download application letter PDF ✅

---

## 📌 Quick Copy-Paste for Testing

**Test Login 1:**
```
USN: 4MC23CS001
DOB: 120305
```

**Test Login 2:**
```
USN: 4MC23CI002
DOB: 210705
```

**Test Login 3:**
```
USN: 4MC22EE003
DOB: 051104
```

---

**Happy Testing! 🎉**
