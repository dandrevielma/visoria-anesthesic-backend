# 🚀 Quick Start - Testing with Postman

## 1. Import Collection (30 seconds)

1. Open Postman
2. Click **Import** button (top-left)
3. Drag and drop `Postman_Collection.json` OR click "Upload Files" and select it
4. Done! Collection appears in left sidebar

## 2. Start Your Server

```bash
npm run dev
```

✅ Server running at: http://localhost:8080

## 3. First Test - Register & Login

### Register (Skip if you have account)
1. Open collection → **1. Authentication** → **Sign Up (Register)**
2. Click **Send**
3. ⚠️ **Important**: Email verification is required
   - **Quick fix**: Set `requireEmailVerification: false` in `src/lib/auth.ts`
   - Or verify email manually (check your email)

### Login
1. Open **Sign In (Login)**
2. Use same email/password from registration
3. Click **Send**
4. ✅ Check response - you should see `session.token`
5. ✅ Auth token is auto-saved! (Check collection Variables tab)

### Test Auth Working
1. Open **Get Session (Current User)**
2. Click **Send**
3. ✅ Should return your user info

---

## 4. Complete Workflow Test (5 minutes)

Follow this exact order:

### Step 1: Login
- **Sign In (Login)** → Send

### Step 2: Create Patient
- **Create Patient** → Send
- ✅ Patient ID auto-saved

### Step 3: Create Record
- **Create Record** → Send
- ✅ Record ID and Form Token auto-saved
- 🔗 Check Console for form link: `http://localhost:3000/form/{token}`

### Step 4: View Record
- **Get Record Details** → Send
- ✅ See full record with patient info

### Step 5: Update Record
- **Update Record** → Change status to "in_progress" → Send
- ✅ Record updated

---

## 5. What's Working vs. What's Not

### ✅ Working Now (Use These!)
- User registration & login
- Patient CRUD (create, list, update, delete)
- Record CRUD (create, list, update, delete)
- Role assignment
- Auth token auto-saved between requests

### ⏳ Not Implemented Yet
- Public form endpoints (patients filling forms)
- Medical profile management
- Doctor evaluations
- File uploads

See `API_STATUS.md` for complete details.

---

## 6. Troubleshooting

### "Unauthorized" Error
**Problem**: Auth token not being sent
**Fix**: Make sure you ran "Sign In" first. Token auto-saves to collection variables.

### Email Verification Blocking Registration
**Problem**: Can't login after registration
**Fix**: Edit `src/lib/auth.ts`:
```typescript
requireEmailVerification: false,  // ← Change this
```

### "Patient not found"
**Problem**: Patient ID variable not set
**Fix**: Run "Create Patient" request first. Check Variables tab to verify `patientId` is saved.

### Can't Create Record
**Problem**: Missing patient_id
**Fix**: Create a patient first, then use `{{patientId}}` variable in record creation

---

## 7. Pro Tips

### View Auto-Saved Variables
- Click collection name → **Variables** tab
- See: authToken, userId, patientId, recordId, formToken

### Test Multiple Scenarios
- Change email in Sign Up to create different users
- Create multiple patients with different IDs
- Test different record statuses: pending → in_progress → completed

### Enable Console Logging
- View → Show Postman Console
- See all variable updates and form links

### Collection Runner (Automation)
- Click collection → **Run**
- Select requests to run
- Execute workflow automatically

---

## Need More?

- **Full Setup Guide**: See `POSTMAN_SETUP.md`
- **API Status**: See `API_STATUS.md`
- **Code Documentation**: Check `src/routes/` folders

---

## Next Steps

After you've tested the basic workflow:

1. **Disable email verification** (if testing locally)
2. **Test all patient CRUD operations**
3. **Test record creation and updates**
4. **Implement public form endpoints** (next feature to build)
5. **Add role-based middleware** (security enhancement)

Happy testing! 🎉
