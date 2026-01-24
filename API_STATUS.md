# Current API Status

## ✅ Ready to Use in Postman

### 1. Authentication (better-auth)
- ✅ POST `/api/auth/sign-up/email` - Register new user
- ✅ POST `/api/auth/sign-in/email` - Login
- ✅ GET `/api/auth/get-session` - Get current session
- ✅ POST `/api/auth/sign-out` - Logout
- ⚠️ **Email verification required** (can be disabled in dev)

### 2. Patients (Full CRUD)
- ✅ POST `/api/patients` - Create patient
- ✅ GET `/api/patients` - List patients (with search)
- ✅ GET `/api/patients/:id` - Get patient by ID
- ✅ GET `/api/patients/identification/:number` - Find by ID number
- ✅ PUT `/api/patients/:id` - Update patient
- ✅ DELETE `/api/patients/:id` - Delete patient

### 3. Records (Full CRUD)
- ✅ POST `/api/records` - Create record (auto-generates token)
- ✅ GET `/api/records` - List records (with filters)
- ✅ GET `/api/records/:id` - Get full record details
- ✅ PUT `/api/records/:id` - Update record
- ✅ DELETE `/api/records/:id` - Delete record

### 4. Roles
- ✅ POST `/api/roles` - Assign role to user
- ✅ GET `/api/roles/:userId` - Get user roles
- ✅ DELETE `/api/roles/:id` - Remove role

---

## ⏳ Not Yet Implemented

### Public Form Endpoints (Need to be created)
These endpoints would allow patients to access and fill forms without authentication:

- ❌ GET `/api/records/form/:token` - Get record by token (public)
- ❌ POST `/api/records/form` - Submit patient form (public)
- ❌ POST `/api/records/consent` - Submit consent form (public)

**Note**: The Postman collection includes these endpoints for reference, but they need to be implemented in the backend.

### Medical Profile Endpoints
- ❌ GET `/api/patients/:id/medical-profile` - Get profile
- ❌ POST `/api/patients/:id/medical-profile` - Create profile
- ❌ PUT `/api/patients/:id/medical-profile` - Update profile

### Doctor Evaluation
- ❌ POST `/api/records/:id/evaluation` - Submit doctor evaluation
- ❌ GET `/api/records/:id/evaluation` - Get evaluation

### File Upload
- ❌ POST `/api/patients/:id/files` - Upload patient document
- ❌ GET `/api/patients/:id/files` - List patient files
- ❌ DELETE `/api/files/:id` - Delete file

---

## Quick Test Workflow (What Works Now)

1. **Register & Login** ✅
   ```
   POST /api/auth/sign-up/email
   POST /api/auth/sign-in/email
   ```

2. **Assign Role** ✅
   ```
   POST /api/roles
   Body: { "user_id": "{userId}", "role": "doctor" }
   ```

3. **Create Patient** ✅
   ```
   POST /api/patients
   Body: { "identification_number": "12345678", "first_name": "Maria", ... }
   ```

4. **Create Record** ✅
   ```
   POST /api/records
   Body: { "patient_id": "{patientId}", "type": "pre_anesthesia", ... }
   ```
   → Returns `form_link_token` (but no public endpoint to use it yet)

5. **View Record** ✅
   ```
   GET /api/records/{recordId}
   ```

6. **Update Record Status** ✅
   ```
   PUT /api/records/{recordId}
   Body: { "status": "in_progress" }
   ```

---

## To Enable Full Patient Form Workflow

You need to implement the public form endpoints. Here's a suggested implementation order:

1. **Add public form retrieval**
   ```typescript
   // GET /api/records/form/:token (no auth required)
   router.get("/form/:token", async (req, res) => {
     const record = await db
       .selectFrom("record")
       .where("form_link_token", "=", req.params.token)
       .executeTakeFirst();
     // return record data
   });
   ```

2. **Add patient form submission**
   ```typescript
   // POST /api/records/form (no auth required)
   router.post("/form", async (req, res) => {
     const { token, ...formData } = req.body;
     // verify token, save to patient_record_form table
   });
   ```

3. **Add consent form submission**
   ```typescript
   // POST /api/records/consent (no auth required)
   router.post("/consent", async (req, res) => {
     const { token, ...consentData } = req.body;
     // verify token, save to consent table
   });
   ```

---

## Environment Setup for Postman

Make sure your `.env` has:
```env
BASE_URL=http://localhost:8080
WEBSITE_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

And server is running:
```bash
npm run dev
```
