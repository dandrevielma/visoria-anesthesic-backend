# Postman Setup Guide for Pre-Anesthesia API

## Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Postman_Collection.json` from this directory
4. The collection will appear with all endpoints organized

### 2. Configure Environment (Optional but Recommended)
The collection uses variables that auto-update as you progress through the workflow:
- `baseUrl`: http://localhost:8080 (default)
- `authToken`: Auto-saved after login
- `userId`: Auto-saved after registration/login
- `patientId`: Auto-saved when creating a patient
- `recordId`: Auto-saved when creating a record
- `formToken`: Auto-saved when creating a record (used for public form links)

### 3. Start Your Server
```bash
npm run dev
```
Server should be running on `http://localhost:8080`

---

## Complete Workflow

### Step 1: Register & Login
1. **Sign Up (Register)** - Create a new account
   - POST `/api/auth/sign-up/email`
   - Body: email, password, name
   - ⚠️ **Note**: Email verification is required. See "Email Verification" section below

2. **Sign In (Login)** - Login to existing account
   - POST `/api/auth/sign-in/email`
   - Body: email, password
   - ✅ Auth token is automatically saved to variables

3. **Get Session** - Verify you're logged in
   - GET `/api/auth/get-session`
   - Uses saved auth token

### Step 2: Assign Role (Optional but Recommended)
1. **Assign Role to User**
   - POST `/api/roles`
   - Body: `{ "user_id": "{{userId}}", "role": "doctor" }`
   - Roles: `admin`, `doctor`, `nurse`
   - Your userId is auto-saved from login

### Step 3: Create Patient
1. **Create Patient**
   - POST `/api/patients`
   - Body: identification_number (unique), first_name, last_name, email, phone, date_of_birth
   - ✅ Patient ID is automatically saved

2. **List Patients** (optional)
   - GET `/api/patients?search=Garcia`
   - Search by name, email, or ID number

### Step 4: Create Medical Record
1. **Create Record**
   - POST `/api/records`
   - Body: patient_id, type, status, scheduled_date, notes
   - ✅ Record ID and Form Token are automatically saved
   - 🔗 **Form link is logged in console**: `http://localhost:3000/form/{token}`

2. **Get Record Details**
   - GET `/api/records/{{recordId}}`
   - View full record with all related data

### Step 5: Patient Fills Forms (Public - No Auth Required!)
These endpoints don't require authentication - patients use the form token:

1. **Get Form by Token** (Patient view)
   - GET `/api/records/form/{{formToken}}`
   - Shows patient their record and what forms to fill

2. **Submit Patient Form**
   - POST `/api/records/form`
   - Body: token, medical_history, anesthesia_history, current_health
   - Patient provides medical information

3. **Submit Consent Form**
   - POST `/api/records/consent`
   - Body: token, consent_type, patient_signature, agreed_terms
   - Digital signature collection

### Step 6: Update Record Status
1. **Update Record**
   - PUT `/api/records/{{recordId}}`
   - Body: `{ "status": "in_progress", "notes": "Forms received" }`
   - Status values: `pending`, `in_progress`, `completed`, `cancelled`

---

## Email Verification

Your API requires email verification by default. You have two options:

### Option A: Bypass Email Verification (Development Only)
Temporarily disable verification in `src/lib/auth.ts`:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false,  // ← Change to false
  // ... rest of config
}
```

### Option B: Use Email Verification (Production-like)
1. Check your email after registration
2. Click the verification link
3. Or manually verify in database:
```sql
UPDATE "user" SET "emailVerified" = true WHERE email = 'your-email@example.com';
```

---

## Troubleshooting

### "Unauthorized" Error
- Make sure you've run the **Sign In** request first
- Check that `authToken` variable is populated in the collection
- Auth token is automatically added to all protected endpoints

### "Patient not found" / "Record not found"
- Make sure you've created the patient/record first
- Variables are auto-saved when you create resources
- Check collection variables by clicking the collection → Variables tab

### Form Token Not Working
- Create a new record to get a fresh token
- Token is automatically saved to `{{formToken}}` variable
- Check console output after creating a record for the form link

### Can't Create Record
- Make sure patient exists (`{{patientId}}` is set)
- Make sure you're authenticated (`{{authToken}}` is set)
- Check that `patient_id` in the request matches an existing patient

---

## Testing Tips

1. **Use Collection Runner** for automated testing:
   - Select collection → Click "Run"
   - Execute entire workflow automatically

2. **Environment Variables**:
   - View current values: Click collection → Variables tab
   - Manually set values if needed

3. **Console Logs**:
   - Open Postman Console (View → Show Postman Console)
   - See variable updates and form link URLs

4. **Multiple Test Users**:
   - Change email in Sign Up to create different users
   - Each user can have different roles

---

## API Endpoints Summary

### Protected (Requires Auth Token)
- **Patients**: `/api/patients` - Full CRUD
- **Records**: `/api/records` - Full CRUD  
- **Roles**: `/api/roles` - Assign/view/remove roles
- **Auth**: `/api/auth/*` - Session management

### Public (No Auth - Uses Token)
- **Forms**: `/api/records/form/{token}` - Get form
- **Submit**: `/api/records/form` - Submit patient form
- **Consent**: `/api/records/consent` - Submit consent

---

## Next Steps

After basic workflow works:
- [ ] Implement role-based middleware (restrict admin-only actions)
- [ ] Add medical profile endpoints (patient medical history versioning)
- [ ] Add file upload endpoints (patient documents)
- [ ] Add doctor evaluation endpoints

---

## Support

For issues or questions:
1. Check server logs: `npm run dev` output
2. Check Postman console for detailed error messages
3. Verify database connection in `.env`
4. Ensure all migrations are run: `npm run migrate`
