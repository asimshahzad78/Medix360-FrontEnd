# HMIS Architecture And Product Roadmap

Created: 2026-04-25

This document describes the current frontend architecture of this HMIS project and proposes a practical roadmap toward a world-class hospital management system. It assumes the frontend is Vue 3 with Vite and TypeScript, and the backend is an ASP.NET Core Web API.

This is a product and architecture planning document, not legal or clinical advice. Healthcare laws, billing rules, prescriptions, privacy rules, consent, and clinical workflows must be reviewed with qualified local experts before production use.

## 1. Product Vision

The target system should become a complete hospital operating platform, not only a billing or registration tool. A strong HMIS should cover the full patient journey:

- Before visit: appointment booking, patient portal, reminders, eligibility, referrals.
- Arrival: registration, queue, triage, consent, insurance or payment setup.
- Care delivery: OPD, emergency, IPD, nursing, prescriptions, lab, radiology, procedures, surgery, clinical notes.
- Discharge: final billing, discharge summary, medication plan, follow-up scheduling.
- Back office: finance, HR, inventory, procurement, assets, audit, compliance, analytics.
- Digital ecosystem: interoperability, patient communication, mobile access, reporting, decision support.

The product should be designed around speed, patient safety, auditability, privacy, and clear workflows for busy hospital staff.

## 2. Current Frontend Architecture

### 2.1 Technology Stack

- Framework: Vue 3.
- Build tool: Vite.
- Language: TypeScript.
- State management: Pinia.
- Routing: Vue Router.
- HTTP client: Axios.
- Charts: ApexCharts via `vue3-apexcharts`.
- Styling: scoped Vue CSS plus global CSS files from `public/assets/styles`.
- Backend: ASP.NET Core API, consumed via Axios from `VITE_API_ORIGIN + /api`.

### 2.2 Main Application Files

- `src/main.ts`: creates the Vue app, installs Pinia, Router, and ApexCharts.
- `src/App.vue`: renders the active route.
- `src/router/index.ts`: composes module routes and applies permission-based navigation guards.
- `src/services/api.ts`: central Axios instance, attaches JWT token, handles HTTP 401.
- `src/store/auth.store.ts`: stores token, user, and permissions in Pinia and localStorage.
- `src/layouts/MainLayout.vue`: authenticated app shell with sidebar and header.
- `src/layouts/FullWidthLayout.vue`: public or special page layout.
- `src/components/AppSidebar.vue`: permission-aware navigation menu.
- `src/components/AppHeader.vue`: top navigation.

### 2.3 Current Module Pattern

Most feature modules follow this shape:

- `*.routes.ts`: route definitions.
- `*.service.ts`: API calls.
- `*.types.ts`: DTO and view model types.
- `*.vue`: pages, detail screens, lists, modals, print views.

This is a good modular frontend pattern. It should be kept and formalized.

### 2.4 Current Implemented Or Partially Implemented Modules

| Area | Current Surface |
| --- | --- |
| Authentication | Login, forgot password, reset password, current account API call |
| Authorization | JWT token, permission array, route guard, permission-based sidebar |
| Dashboard | Summary cards, revenue chart, patient trend, recent payments, recent checkups |
| Patients | Patient list, patient form modal, patient detail, patient history modal |
| Doctors | Doctor list, detail, profile |
| Appointments | Appointment list and calendar routes exist |
| OPD / Checkups | Checkup list, checkup modal, patient checkup history |
| Payments | Payment list, form modal, detail, invoice print, thermal print |
| Finance | Chart of accounts, revenue vouchers, expense vouchers, daily closing, counter closing |
| Admin | Company info, payment categories, user management |
| User Management | Users, active status, job role assignment, user permissions, reset password |
| Employees | Employee list, form modal, detail, create user from employee |
| HR | Departments, designations, shifts, leave types, permissions, attendance logs, duty rosters, leave balances, leave requests, payrolls, credentials, training, performance, disciplinary incidents, employment tags |

### 2.5 Current Planned But Placeholder Areas

The sidebar already hints at several future modules, but many currently route to `/dashboard` or have no dedicated route/module yet:

- Prescriptions.
- Diagnosis.
- Vital signs.
- Procedures.
- Follow-ups.
- Laboratory tests, categories, sample collection, results.
- Pharmacy medicines, categories, stock, medicine issue.
- Reports for patient, finance, and lab.
- Roles and permissions management beyond direct user permission assignment.

These are strong next candidates because the UI already communicates them as product areas.

## 3. Current Architecture Strengths

- Modular feature folder structure is easy to extend.
- Route arrays per module keep feature boundaries understandable.
- Central Axios client is in place.
- JWT and permission handling are already connected to navigation.
- Print and thermal print support exists for payments.
- Finance and HR are more developed than many early HMIS systems.
- User permission management is already present, which is essential for hospital-grade security.

## 4. Current Architecture Risks And Improvements

### 4.1 Permission Logic Is Duplicated

Permissions are checked in `src/router/index.ts` and again in `src/components/AppSidebar.vue`.

Recommended improvement:

- Create `src/services/permissions.ts` or `src/security/permissions.ts`.
- Define route-to-permission mapping once.
- Use the same source for router guards, sidebar visibility, and page-level action controls.

### 4.2 API Response Shape Is Inconsistent

Some services handle PascalCase, camelCase, `ModelObject`, arrays, and raw DTOs manually.

Recommended improvement:

- Standardize ASP.NET Core API responses.
- Prefer one response envelope, for example:

```ts
type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
  correlationId?: string
}
```

- For validation failures, use RFC 7807 style problem details or a consistent validation response.
- Keep frontend mapping helpers, but gradually reduce ad hoc parsing.

### 4.3 Auth Persistence Uses localStorage

The token is stored in localStorage. This is simple, but less secure against XSS.

Recommended improvement:

- For production, consider secure, HttpOnly, SameSite cookies for refresh tokens.
- Keep short-lived access tokens.
- Add refresh token rotation.
- Add session timeout and forced logout after role or permission changes.

### 4.4 Route Guard Is Prefix Based

Prefix rules are simple but can become fragile as the app grows.

Recommended improvement:

- Put required permissions in route `meta`.
- Build a small route guard that checks `to.matched` route metadata.
- Add action-level checks for Create, Update, Delete, Post, Reverse, Print, Export, Approve.

Example:

```ts
meta: {
  title: 'Payments',
  permissions: ['Finance.Payments.View'],
}
```

### 4.5 Global UX System Needs Formalizing

Many screens use local CSS. This is workable now, but a world-class product needs consistent controls.

Recommended improvement:

- Create shared components for tables, filters, modals, drawers, tabs, status badges, empty states, loaders, confirmation dialogs, toasts, date pickers, and permission-aware buttons.
- Create design tokens for color, spacing, typography, z-index, shadows, status colors, and form density.
- Build a consistent list-detail-modal pattern.

### 4.6 Audit And Clinical Safety Are Not Visible Yet

Hospitals need traceability.

Recommended improvement:

- Every create/update/delete/post/reverse/cancel action should have audit logs.
- Clinical edits should preserve history rather than overwrite critical data.
- Sensitive screens should show who last changed data and when.

### 4.7 Frontend Baseline Implemented

The frontend now includes a first implementation pass for the risks above:

- `src/security/permissions.ts` centralizes permission constants, menu visibility, route permissions, and first-allowed-route logic.
- `src/router/index.ts` applies route permissions into `meta.permissions` and guards routes from that metadata.
- `src/components/AppSidebar.vue` now uses the centralized permission registry instead of a local permission switch.
- `src/security/auth-session.ts` centralizes auth persistence and rejects expired JWTs.
- `src/services/api-response.ts` provides a consistent API response/error helper and correlation ID creation.
- `src/services/api.ts` attaches `X-Correlation-ID`, uses the centralized token helper, and clears the auth session on 401.
- `src/components/ui` contains reusable modal, status badge, permission button, and audit metadata components.
- `src/services/audit.service.ts` and `src/types/audit.ts` provide frontend scaffolding for backend audit log integration.

Backend work is still required for secure HttpOnly refresh cookies, persisted audit logs, standardized response envelopes, and clinical record versioning.

## 5. Target System Modules

The following modules are recommended for a mature HMIS.

### 5.1 Core Platform

| Module | Purpose | Priority |
| --- | --- | --- |
| Multi-tenant / Multi-facility | Manage hospitals, branches, departments, counters, wards, stores | High |
| Auth, RBAC, ABAC | Roles, permissions, policy rules, emergency access, delegated access | High |
| Audit Trail | Full user activity, clinical audit, financial audit, before/after values | High |
| Notifications | Email, SMS, WhatsApp, in-app alerts, reminders | High |
| Document Management | Uploads, scanned documents, consent forms, attachments | High |
| Master Data | Departments, services, items, doctors, counters, rooms, wards, templates | High |
| Settings | Hospital-level configuration, numbering series, print templates, tax, currency | High |

### 5.2 Patient Administration

| Module | Features | Priority |
| --- | --- | --- |
| Patient Registration | MR number, demographics, guardian, contacts, address, photo, national ID, duplicate detection | High |
| Patient Merge | Merge duplicate records with audit and approval | High |
| Patient Timeline | Unified visits, admissions, orders, prescriptions, payments, documents | High |
| Queue Management | OPD queues, token display, priority handling, counter assignment | High |
| Consent Management | Consent templates, signatures, procedure consent, privacy consent | High |
| Patient Portal | Appointments, lab results, invoices, prescriptions, follow-ups | Medium |
| Feedback / Complaints | Patient satisfaction, complaints, resolution tracking | Medium |

### 5.3 Clinical / EMR

| Module | Features | Priority |
| --- | --- | --- |
| OPD Encounter | Chief complaint, history, examination, diagnosis, plan, follow-up | High |
| Vitals | BP, pulse, temperature, oxygen, height, weight, BMI, pain score, growth charts | High |
| Diagnosis | ICD coding, provisional/final diagnosis, diagnosis history | High |
| Prescriptions | Medication orders, dosage, duration, instructions, interaction checks, print | High |
| Orders | Lab, radiology, procedure, medication, admission, referral orders | High |
| Allergies | Drug, food, environmental allergies, severity, reaction | High |
| Problem List | Active and resolved conditions | High |
| Clinical Notes Templates | Specialty templates, quick phrases, structured notes | Medium |
| Care Plans | Longitudinal plans for chronic disease and complex care | Medium |
| Immunization | Vaccine schedule, administered vaccines, reminders | Medium |
| Clinical Decision Support | Rule-based alerts, duplicate test alerts, drug allergy warnings | Medium |
| Referral Management | Internal and external referrals, notes, status tracking | Medium |

### 5.4 Emergency Department

| Module | Features | Priority |
| --- | --- | --- |
| Triage | Severity category, vitals, arrival mode, emergency reason | High |
| Emergency Encounter | Rapid assessment, orders, procedures, disposition | High |
| Trauma / Resuscitation Sheet | Time-based actions, medication, CPR events | Medium |
| Observation Beds | Short stay monitoring, nurse notes, discharge/admit decision | Medium |

### 5.5 IPD / Inpatient

| Module | Features | Priority |
| --- | --- | --- |
| Admission | Admit from OPD/ER, consultant, ward, bed, package, payer | High |
| Bed Management | Wards, rooms, beds, occupancy, transfers, isolation flags | High |
| Nursing Station | Nurse notes, medication administration record, vitals charting | High |
| Ward Rounds | Daily progress notes, orders, plan updates | High |
| Discharge | Discharge summary, final diagnosis, final bill, follow-up, medication plan | High |
| Case Sheet | Complete inpatient file and printable chart | Medium |
| Diet Orders | Diet plan, restrictions, kitchen communication | Medium |

### 5.6 Laboratory Information System

| Module | Features | Priority |
| --- | --- | --- |
| Lab Catalog | Tests, panels, sample types, containers, reference ranges, prices | High |
| Lab Orders | OPD/IPD/ER test ordering, urgent flag, payment status | High |
| Sample Collection | Barcode labels, collection time, collector, rejection reason | High |
| Result Entry | Numeric/text results, abnormal flags, attachments | High |
| Result Verification | Technician entry, pathologist approval, amendment workflow | High |
| Lab Reports | Printable and portal-visible reports | High |
| Analyzer Integration | HL7 or device middleware integration | Medium |
| Quality Control | Controls, calibration, lot tracking | Medium |

### 5.7 Radiology / Imaging

| Module | Features | Priority |
| --- | --- | --- |
| Imaging Catalog | X-ray, ultrasound, CT, MRI, procedure setup, pricing | High |
| Radiology Orders | OPD/IPD/ER order workflow | High |
| Scheduling | Modality calendar, slots, room assignment | Medium |
| Reporting | Structured report templates, radiologist approval | High |
| PACS Integration | DICOM viewer link, accession number, study status | Medium |
| Critical Findings | Alert workflow and acknowledgement | Medium |

### 5.8 Pharmacy

| Module | Features | Priority |
| --- | --- | --- |
| Drug Master | Generic, brand, strength, dosage form, route, schedule, barcode | High |
| Prescription Dispensing | Verify prescription, substitute, partial dispense, returns | High |
| Pharmacy Stock | Batch, expiry, cost, selling price, stock ledger | High |
| Purchase / GRN | Purchase orders, supplier, goods receipt, invoice matching | High |
| Expiry Management | Near-expiry alerts, returns, write-off | High |
| Controlled Drugs | Strict access, double verification, audit reports | Medium |
| Drug Interaction Checks | Allergy, duplicate therapy, interaction alerts | Medium |

### 5.9 Billing, Insurance, And Revenue Cycle

| Module | Features | Priority |
| --- | --- | --- |
| Service Catalog | Consultation, procedures, lab, radiology, packages | High |
| OPD Billing | Bills, discounts, receipts, refunds, cancellation | High |
| IPD Billing | Bed charges, services, orders, package billing, deposits | High |
| Insurance / Panel Billing | Payer contracts, approvals, claim submission, co-pay | High |
| Cashier Management | Counter opening, counter closing, reconciliation | High |
| Discounts And Approvals | Role-based discount limits and approval workflow | High |
| Claims Management | Pre-auth, claim status, rejection, resubmission | Medium |
| Accounts Receivable | Patient and payer balances, aging, collections | Medium |

### 5.10 Finance

| Module | Features | Priority |
| --- | --- | --- |
| Chart Of Accounts | Already present, should be expanded with account types and control accounts | High |
| Vouchers | Revenue, expense, journal, payment, receipt vouchers | High |
| Posting Engine | Automatic accounting entries from billing, pharmacy, inventory, payroll | High |
| Bank / Cash | Cash book, bank book, reconciliation | Medium |
| Budgeting | Department budgets, variance reports | Medium |
| Financial Statements | Trial balance, income statement, balance sheet, cash flow | Medium |

### 5.11 Inventory And Procurement

| Module | Features | Priority |
| --- | --- | --- |
| Item Master | Medical, surgical, office, biomedical, consumables | High |
| Store Management | Main store, sub stores, pharmacy store, OT store, ward store | High |
| Stock Ledger | Batch, expiry, unit conversion, valuation | High |
| Requisition | Department requests and approvals | High |
| Purchase Orders | Supplier quotes, PO approval, GRN | High |
| Issue / Return | Store issue, return, transfer, adjustment | High |
| Stock Counts | Physical count, variance approval | Medium |

### 5.12 Human Resources

You already have a strong HR foundation. Add these next:

| Module | Features | Priority |
| --- | --- | --- |
| Employee Lifecycle | Recruitment, onboarding, transfers, separation | Medium |
| Attendance Devices | Biometric integration, shift exceptions, overtime | Medium |
| Credential Expiry | Licenses, certificates, renewals, alerts | High |
| Payroll Integration | Salary rules, deductions, taxes, bank file | Medium |
| Staff Scheduling | Duty roster linked to departments and doctors | High |
| Performance | Appraisal cycles, goals, competencies | Medium |

### 5.13 Operation Theatre, ICU, And Procedure Areas

| Module | Features | Priority |
| --- | --- | --- |
| OT Scheduling | Surgeon, anesthetist, room, equipment, case priority | Medium |
| Pre-op Checklist | Consent, labs, anesthesia clearance, safety checklist | Medium |
| Anesthesia Record | Drugs, vitals, events, airway, complications | Medium |
| Procedure Notes | Operative notes, implants, consumables, post-op plan | Medium |
| ICU Flow Sheet | Hourly vitals, intake/output, ventilation, lines, scores | Medium |

### 5.14 Quality, Safety, And Compliance

| Module | Features | Priority |
| --- | --- | --- |
| Incident Reporting | Clinical, medication, fall, infection, security incidents | High |
| Infection Control | HAI surveillance, isolation, antibiotic stewardship | Medium |
| Mortality Review | Case review, root cause, committee decisions | Medium |
| Audit Checklists | Department audits, corrective actions | Medium |
| Risk Register | Operational and clinical risks | Medium |

### 5.15 Analytics And Executive Intelligence

| Module | Features | Priority |
| --- | --- | --- |
| Operational Dashboard | OPD volume, waiting time, bed occupancy, admissions, discharges | High |
| Financial Dashboard | Revenue, collections, outstanding, refunds, discounts | High |
| Clinical Dashboard | Diagnoses, outcomes, lab turnaround, readmission, mortality | Medium |
| HR Dashboard | Attendance, staffing, leave, overtime, vacancies | Medium |
| Data Warehouse | Star schema or analytics database for reporting | Medium |
| Export Center | CSV, Excel, PDF, scheduled reports | High |

### 5.16 Patient Engagement

| Module | Features | Priority |
| --- | --- | --- |
| Patient Portal | Results, prescriptions, appointments, bills, profile | Medium |
| Mobile App / PWA | Patient and doctor mobile workflows | Medium |
| Reminders | Appointment, medication, follow-up, vaccination reminders | Medium |
| Telemedicine | Video consults, chat, document sharing, e-prescription | Medium |
| Digital Payments | Payment links, online deposits, receipts | Medium |

### 5.17 Interoperability

| Module | Features | Priority |
| --- | --- | --- |
| FHIR API Layer | Patient, Practitioner, Encounter, Observation, MedicationRequest, DiagnosticReport, Claim | Medium |
| HL7 v2 Integration | Lab analyzers, radiology, legacy systems | Medium |
| DICOM/PACS | Imaging accession and study integration | Medium |
| Terminology Service | ICD, LOINC, SNOMED CT where licensed/available, local coding | Medium |
| Webhooks / Events | Notify external systems on admission, order, result, discharge | Medium |

## 6. Recommended Product Phases

### Phase 0: Platform Hardening

Goal: make the base architecture production-ready before adding too many modules.

- Centralize permissions and route metadata.
- Standardize API response format from ASP.NET Core.
- Add global error handling, toast notifications, loading states, and confirmation dialogs.
- Add audit log backend and audit viewer frontend.
- Add reusable UI components.
- Add frontend environment config validation.
- Add module-level action buttons that hide/disable based on permission.
- Add logs and correlation IDs across frontend and backend.
- Add automated build, type-check, lint, and smoke tests.

### Phase 1: OPD And Revenue Core

Goal: make daily outpatient operations excellent.

- Improve patient registration and duplicate detection.
- Build patient timeline.
- Complete appointments and queue management.
- Complete OPD encounter with vitals, diagnosis, prescription, lab/radiology orders, procedures, follow-up.
- Complete payments, receipts, refunds, discounts, cashier closing.
- Add reports for OPD volume, revenue, doctor performance, and payment summaries.

### Phase 2: Clinical Departments

Goal: connect clinical orders to departments.

- Build laboratory module.
- Build radiology module.
- Build pharmacy module.
- Add order lifecycle and order status tracking.
- Add result reports, approvals, amendments, and patient portal visibility.
- Add medicine stock with batch and expiry.

### Phase 3: Inpatient And Hospital Operations

Goal: support admitted patient care and large hospital workflow.

- Add admission and bed management.
- Add nursing station and medication administration record.
- Add ward rounds and inpatient orders.
- Add discharge workflow and discharge summary.
- Add IPD billing and deposits.
- Add OT scheduling and procedure notes.
- Add inventory and procurement.

### Phase 4: Enterprise, Intelligence, And Integration

Goal: become a premium, scalable hospital platform.

- Add FHIR-compatible interoperability layer.
- Add patient portal and mobile workflows.
- Add insurance claims and panel billing.
- Add data warehouse and advanced dashboards.
- Add AI-assisted documentation and analytics with human review.
- Add multi-facility support and enterprise administration.

## 7. Recommended Backend Architecture For ASP.NET Core API

### 7.1 Backend Layers

Recommended layers:

- API layer: controllers, request validation, authentication, response formatting.
- Application layer: commands, queries, DTOs, business workflows.
- Domain layer: entities, domain services, business rules.
- Infrastructure layer: EF Core, external integrations, email/SMS, file storage, background jobs.
- Reporting layer: read models, materialized views, report queries.
- Integration layer: FHIR, HL7, DICOM/PACS connectors, webhooks.

### 7.2 API Standards

- Use versioned API routes, for example `/api/v1/patients`.
- Use consistent casing. Prefer camelCase JSON for frontend.
- Use paging response for lists:

```ts
type PagedResult<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}
```

- Use `ProblemDetails` for validation and server errors.
- Use optimistic concurrency on important records using `rowVersion` or equivalent.
- Use idempotency keys for payment, posting, and order creation.
- Add `createdBy`, `createdAt`, `updatedBy`, `updatedAt` where appropriate.
- Do not physically delete clinical or financial data in normal workflows. Use cancel, void, reverse, retire, or inactive statuses.

### 7.3 Data Ownership

For a hospital product, data ownership must be very clear:

- Patient identity belongs to patient administration.
- Encounters own clinical notes, vitals, diagnoses, orders, and care plan records.
- Billing owns invoices, receipts, discounts, refunds, claims, and balances.
- Finance owns posted accounting entries.
- Inventory owns stock ledgers and valuation.
- HR owns employee profiles and scheduling.
- Audit owns immutable event records.

### 7.4 Suggested Core Entities

- Organization, Facility, Department, SubDepartment, Room, Ward, Bed.
- User, Role, Permission, UserRole, UserPermissionOverride, Session.
- Employee, DoctorProfile, Credential, Shift, AttendanceLog, DutyRoster.
- Patient, PatientIdentifier, PatientContact, PatientDocument, PatientMerge.
- Appointment, QueueTicket.
- Encounter, Vitals, Diagnosis, ClinicalNote, Allergy, Problem, FollowUp.
- Order, OrderItem, LabOrder, RadiologyOrder, ProcedureOrder.
- Prescription, MedicationRequest, Dispense, Drug, DrugBatch.
- LabTest, LabPanel, Sample, LabResult, LabResultApproval.
- RadiologyStudy, RadiologyReport.
- Admission, BedAssignment, Transfer, NurseNote, MAR, DischargeSummary.
- Invoice, InvoiceItem, Receipt, Refund, DiscountApproval, Claim.
- ChartOfAccount, Voucher, JournalEntry, FiscalPeriod.
- Item, Store, StockLot, StockLedger, Supplier, PurchaseOrder, GoodsReceipt.
- AuditLog, Notification, Attachment, Consent.

## 8. Permission Model

Use a consistent permission naming convention:

```text
Domain.Module.Action
```

Examples:

- `Patients.View`
- `Patients.Create`
- `Patients.Update`
- `Patients.Delete`
- `Patients.Merge`
- `OPD.Encounters.View`
- `OPD.Encounters.Create`
- `OPD.Prescriptions.Sign`
- `Lab.Results.Enter`
- `Lab.Results.Verify`
- `Finance.Payments.Refund`
- `Finance.Vouchers.Post`
- `Admin.Users.ResetPassword`
- `Security.AuditLogs.View`

Recommended action groups:

- `View`
- `Create`
- `Update`
- `Delete`
- `Print`
- `Export`
- `Post`
- `Reverse`
- `Approve`
- `Cancel`
- `Verify`
- `Sign`
- `Admin`

Add permission checks at:

- Route level.
- Menu level.
- Button/action level.
- Backend endpoint level.
- Query/data scope level.

For healthcare, backend checks are mandatory. Frontend permission checks improve UX, but must not be treated as security.

## 9. Frontend Architecture Recommendations

### 9.1 Suggested Folder Standard

Keep the current module style and formalize it:

```text
src/
  components/
    ui/
    layout/
    feedback/
    data-table/
  modules/
    patients/
      pages/
      components/
      services/
      types/
      routes.ts
    clinical/
    laboratory/
    pharmacy/
    radiology/
    inpatient/
    billing/
    finance/
    hr/
    admin/
  router/
  services/
  store/
  security/
  utils/
```

### 9.2 Shared UI Components To Add

- `AppDataTable`
- `AppPageHeader`
- `AppFilterBar`
- `AppModal`
- `AppDrawer`
- `AppTabs`
- `AppStatusBadge`
- `AppEmptyState`
- `AppConfirmDialog`
- `AppToast`
- `PermissionButton`
- `MoneyCell`
- `DateTimeCell`
- `PatientSearchBox`
- `DoctorSelect`
- `DepartmentSelect`
- `PrintTemplateShell`

### 9.3 UX Standards For Hospital Screens

- Prefer dense, scannable layouts for operational screens.
- Keep search and filters visible.
- Put primary actions in predictable positions.
- Use status badges for lifecycle states.
- Avoid hiding critical information behind too many clicks.
- Support keyboard-friendly workflows at counters and nursing stations.
- Show clear loading, empty, error, and permission-denied states.
- Confirm destructive or financial actions.
- Keep print previews and final printed output aligned.

## 10. Security, Privacy, And Compliance

Healthcare systems handle highly sensitive data. Security must be designed into the architecture from the beginning.

Recommended controls:

- Multi-factor authentication for admin and clinical signing roles.
- Strong password policy or identity provider integration.
- Short access token lifetime and refresh token rotation.
- Role-based access control plus data scoping by facility, department, counter, or doctor where needed.
- Complete audit logs for patient, clinical, financial, and admin activity.
- Encryption in transit via HTTPS.
- Encryption at rest for backups and sensitive files.
- Secure file upload scanning and content-type validation.
- Rate limiting and brute-force protection.
- Session timeout and device/session management.
- Break-glass emergency access with reason capture and audit.
- Database backups, restore tests, and disaster recovery plan.
- Secure coding verification using OWASP ASVS as a baseline.

If the system is deployed in the United States or handles US-regulated data, HIPAA requirements must be assessed. Even outside the US, HIPAA-style administrative, physical, and technical safeguards are a useful benchmark for protecting electronic health information.

## 11. Interoperability Direction

A modern HMIS should avoid becoming a data island.

Recommended direction:

- Internally keep your domain model clean and practical.
- Expose interoperability through a separate adapter layer.
- Map important entities to HL7 FHIR resources.

Useful FHIR resource mappings:

| HMIS Concept | FHIR Resource |
| --- | --- |
| Patient | Patient |
| Doctor / staff | Practitioner |
| Department / facility | Organization, Location |
| Appointment | Appointment |
| Visit / admission | Encounter |
| Vitals / lab values | Observation |
| Diagnosis | Condition |
| Prescription | MedicationRequest |
| Dispensing | MedicationDispense |
| Lab report | DiagnosticReport |
| Procedure | Procedure |
| Invoice / claim | Invoice, Claim |

FHIR should not be forced into every internal database table. Use it as an integration contract where it helps external systems communicate.

## 12. Reporting Requirements

### Operational Reports

- Daily OPD summary.
- Doctor-wise patient count.
- Department-wise visits.
- Appointment no-show report.
- Queue waiting time.
- Bed occupancy.
- Admissions and discharges.
- Lab turnaround time.
- Pharmacy stock and expiry.

### Financial Reports

- Daily collection.
- Counter closing.
- Payment mode summary.
- Discount report.
- Refund report.
- Outstanding balances.
- Insurance receivables.
- Revenue by department/service/doctor.
- Trial balance and ledger.

### Clinical Reports

- Diagnosis trends.
- Procedure volume.
- Abnormal lab results.
- Critical result acknowledgement.
- Readmissions.
- Mortality review.
- Infection control indicators.

### HR Reports

- Attendance.
- Leave.
- Overtime.
- Shift coverage.
- Credential expiry.
- Training compliance.

## 13. AI And Advanced Features

AI can make the product feel modern, but it must be implemented carefully in healthcare.

Good AI candidates:

- Clinical note drafting from structured inputs.
- Visit summary generation.
- Discharge summary draft.
- Billing anomaly detection.
- Duplicate patient detection.
- Smart search across patient history.
- Triage support prompts.
- Inventory demand forecasting.
- No-show prediction.
- Revenue leakage detection.

Safety rules:

- AI output must be clearly marked as draft.
- Clinician must review and sign clinical output.
- Never hide source data behind AI summaries.
- Keep audit logs of AI-assisted content.
- Avoid using patient data with external AI vendors unless legal, privacy, and contractual controls are complete.

## 14. Suggested Immediate Next Development Tasks

Based on the current codebase, the best next tasks are:

1. Create a central permission registry and refactor router/sidebar to use it.
2. Add shared `AppModal`, `AppDataTable`, `AppConfirmDialog`, and `AppToast`.
3. Create real modules for prescriptions, diagnosis, vitals, procedures, and follow-ups.
4. Create laboratory module because the sidebar and permissions already expect it.
5. Create pharmacy module with medicine master and stock ledger.
6. Add patient timeline combining patient, checkup, payment, prescription, lab, and document events.
7. Add audit log API and frontend viewer.
8. Standardize ASP.NET Core API response format and frontend service mapping.
9. Add report module shell with patient, finance, lab, HR, and admin sections.
10. Add backend and frontend integration tests for auth, permissions, patient flow, payment flow, and checkup flow.

## 15. Suggested MVP For A Strong Version 1

If the goal is to ship a strong first production version, focus on:

- Login, roles, permissions, audit.
- Patient registration and patient timeline.
- Appointments and queue.
- OPD encounter with vitals, diagnosis, prescription, orders, follow-up.
- Payments, receipt, refund, counter closing.
- Lab catalog, order, sample, result, report.
- Pharmacy medicine master, stock, prescription dispensing.
- Core finance posting.
- HR staff and duty roster.
- Basic dashboards and reports.

This would already cover the daily flow of many small and medium hospitals.

## 16. Suggested Enterprise Version

For a world-class enterprise version, add:

- Multi-facility deployment.
- IPD, beds, nursing, discharge.
- OT, ICU, emergency.
- Insurance claims and payer contracts.
- Inventory and procurement.
- Radiology with PACS links.
- Patient portal and mobile workflows.
- Interoperability layer using FHIR and HL7.
- Data warehouse and executive analytics.
- AI-assisted documentation with strict human approval.
- High availability, backups, monitoring, and disaster recovery.

## 17. Source References

- HL7 FHIR R5 Overview: https://www.hl7.org/fhir/overview.html
- HHS HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/index.html
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- WHO Global Strategy on Digital Health 2020-2027: https://www.who.int/publications/i/item/9789240116870
