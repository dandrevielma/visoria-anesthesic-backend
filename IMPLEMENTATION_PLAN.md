# Pre-Anesthesia App - Implementation Plan

## Phase 1: Database & Core Structure ⏳
- [x] Clean up old migrations
- [ ] Create database migrations (simplified)
- [ ] Run migrations
- [ ] Generate TypeScript types
- [ ] Test database structure

## Phase 2: User & Role Management
- [ ] User role assignment endpoints
- [ ] Role-based middleware
- [ ] Test role permissions

## Phase 3: Patient Management
- [ ] Create patient endpoint
- [ ] List patients endpoint
- [ ] Get/Update/Delete patient
- [ ] Patient medical profile (reusable)
- [ ] Test patient CRUD

## Phase 4: Consulta Management (Core Feature)
- [ ] Create consulta endpoint
- [ ] List consultas (with filters)
- [ ] Get consulta details (full)
- [ ] Assign doctor to consulta
- [ ] Update consulta status
- [ ] Test consulta CRUD

## Phase 5: Patient Forms (Token-based, No Auth)
- [ ] Get form by token endpoint
- [ ] Auto-save draft (PATCH)
- [ ] Submit patient form
- [ ] Update medical profile
- [ ] File upload
- [ ] File management
- [ ] Test patient form flow

## Phase 6: Consent Signing
- [ ] Get consent by token
- [ ] Sign consent (with signature)
- [ ] Generate consent PDF
- [ ] Test consent flow

## Phase 7: Doctor Evaluation
- [ ] Get evaluation endpoint
- [ ] Auto-save draft (PATCH)
- [ ] Submit evaluation
- [ ] Mark evaluation complete
- [ ] Generate evaluation PDF
- [ ] Test doctor evaluation flow

## Phase 8: Email Notifications
- [ ] Setup email provider (Resend)
- [ ] Send form link email
- [ ] Email logging
- [ ] Test email delivery

## Phase 9: PDF Generation
- [ ] Setup PDF library
- [ ] Patient form PDF template
- [ ] Consent PDF template
- [ ] Doctor evaluation PDF template
- [ ] Complete package (ZIP)
- [ ] Test PDF generation

## Phase 10: Dashboard & Search
- [ ] Dashboard summary endpoint
- [ ] My consultas (doctor)
- [ ] Search endpoint
- [ ] Test dashboard

## Phase 11: Frontend Integration & Testing
- [ ] API documentation
- [ ] Integration testing
- [ ] End-to-end testing
- [ ] Production deployment

---

## Current Focus: Phase 1 - Database Structure

**Next:** Create simplified migrations
