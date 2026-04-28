# DTO Coverage Audit

Generated from `C:/Users/Dell/Downloads/New Text Document.txt` against the current `src/` frontend. This is a working checklist, not a backend guarantee: field hit counts are static source matches and should be confirmed with API smoke tests.

## Summary

- Total request/query DTOs audited: 532
- Implemented: 20
- Partially implemented: 392
- Missing form: 119
- API-only / no UI needed: 0
- Unclear / needs backend confirmation: 1

## Status Legend

- Implemented: matching frontend form/service appears to cover most DTO fields.
- Partially implemented: frontend has related screen or some fields, but coverage is incomplete or generic.
- Missing form: no clear frontend form was found.
- API-only / no UI needed: endpoint does not appear to require a direct user form.
- Unclear / needs backend confirmation: contract or frontend ownership is ambiguous.

## Core Form Pass Completed

- `PatientInfoCRUDViewModel`: added spouse name, agreement, profile picture, user type, role id, and multipart support when an image is selected.
- `UserProfileCRUDViewModel` / employee profile: added title, age, profile picture, current URL, and multipart support when an image is selected.
- `CompanyInfoCRUDViewModel`: added fax to the visible form and exposed logo path while preserving logo upload.
- `DepartmentCRUDViewModel` and `DesignationCRUDViewModel`: added description to forms, tables, types, and save payloads.

## Clinical / OPD Pass Completed

- `CheckupSummaryCRUDViewModel`: checkup form now submits `VisitId`, `SerialNo`, `NextVisitDate`, `VitalSigns`, `PaymentType`, `DoctorFee`, `PaymentAccountId`, `CurrentURL`, numeric vitals, diagnosis, advice, comments, and nursing notes.
- `CheckupMedicineDetailsCRUDViewModel`: medicine rows now carry `MedicineId`, `MedicineName`, `NoofDays`, `WhentoTake`, `WhentoTakeDayCount`, `IsBeforeMeal`, and the encounter `VisitId`. `CheckupId` and `PaymentId` stay nullable on create because those IDs are returned after the checkup is saved.
- Diagnostic orders inside checkup now preserve `OrderType` (`Lab` or `Radiology`), display name, selected test/study id, and price.
- Vitals contract decision: the active UI contract is still the legacy `VitalSignsCRUDViewModel` plus `CheckupSummaryCRUDViewModel` vital fields on `/api/checkups`. `VitalsWorkflowInputDto` remains `Unclear / needs backend confirmation` until the backend exposes or confirms the newer vitals workflow endpoint.
- OPD workflow page is represented through the active checkup encounter modal. Dedicated workflow DTOs outside `/api/checkups` should be confirmed against backend routes before adding parallel UI.

## Billing / Payments Pass Completed

- `PaymentCategoriesCRUDViewModel` vs `PaymentCategorySaveDto`: current payment category form covers legacy fields (`PaymentItemCode`, `Name`, `UnitPrice`, `Description`) and API fields (`RevenueAccountId`, `IncludeInCounterClosing`).
- `PaymentsCRUDViewModel`: payment modal now carries `PhoneNo`, `InsuranceNo`, `InsuranceCompanyId`, `InsuranceCompanyName`, `InsuranceCoverage`, `InsuranceAmount`, `PaymentStatus`, `CurrentURL`, and `UserRole` in addition to totals, taxes, charges, patient, currency, and visit fields.
- `PaymentsDetailsCRUDViewModel`: payment item rows now type optional `PaymentsId`, `ItemDetailId`, `PaymentType`, item code/name, quantity, unit prize, and total.
- `PaymentModeHistoryCRUDViewModel`: payment modes now type optional `PaymentId` with mode, amount, and reference number.
- Refund, pre-authorization, claim submit, and appeal submit now have dedicated payment service methods and invoice workflow buttons. The buttons ask for backend workflow identifiers instead of guessing voucher, claim, or appeal ids from the receipt.
- Idempotency confirmed/added on checkup create, payment save, refund receipt/revenue/expense, pre-authorization, claim submit, and appeal submit mutations.

## Finance Pass Completed

- `ExpenseVoucherDto`: form covers `Date`, `Description`, `Amount`, `Type`, `ExpenseAccountId`, `BankAccountId`, and `Status`; type values are wired to backend enum order `General`, `PettyCash`, `VendorPayment`, `Adjustment`, `Expense`, `Journal`. Status remains the backend string contract `Unpaid`, `Paid`, `Cancelled`; backend should confirm if `Posted` or `Reversed` are also valid save states.
- `RevenueVoucherDto` / `CreateRevenueDto`: current UI intentionally exposes list, view, post, and reverse only. The add button remains disabled because revenue vouchers are generated from OPD/IPD billing; backend/product confirmation is still needed before enabling manual create/edit.
- `ChartOfAccountDto`: create/update now includes `Code`, `Name`, `Type`, `ParentId`, and `IsActive`; `ParentId` is optional to support backend root-account creation when permitted.
- Finance workflow screens: posting dashboard, refunds, finance claims, revenue analytics/reporting, and export flows are represented through the enterprise finance routes. Dedicated ledger detail and manual revenue-voucher create/edit remain open product/backend decisions.

## HR Pass Completed

- Shared HR CRUD forms still send PascalCase payloads and now add idempotency keys for create/update mutations.
- Employee, shift, and leave-type raw ID fields were replaced with lookup controls where a lookup endpoint already exists.
- Status/severity/rating fields were converted from free text to controlled selects on attendance logs, credentials, disciplinary incidents, leave requests, payrolls, performance appraisals, and training enrollments.
- Shared HR modal now validates required fields, numeric ID fields, select values, and date ordering for leave periods, training dates, credential expiry, and appraisal periods.
- Field-by-field DTO coverage checked for attendance logs, credentials, disciplinary incidents, duty rosters, leave balances, leave requests, leave types, onboarding checklist items, payrolls, performance appraisals, permissions, shifts, and training enrollments. Current forms include the DTO fields present in `hr-lookups.service.ts`; remaining risk is backend enum vocabulary for statuses and any HR expansion DTOs outside these CRUD pages.

## Platform/Core Administration

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AddNewRoleViewModel` | Partially implemented | 2/2 | POST /SystemRole (SaveAddNewRole) |
| `AuditEventCreateDto` | Partially implemented | 3/6 | POST /api/platform/audit-events (Create) |
| `AuditEventFilterDto` | Partially implemented | 16/26 | GET /api/platform/audit-events/filter (Filter) |
| `AuditEventUpdateDto` | Partially implemented | 3/6 | PUT /api/platform/audit-events/{id:long} (Update) |
| `ChangePasswordViewModel` | Partially implemented | 4/5 | POST /Manage (ChangePassword) |
| `CompanyInfoCRUDViewModel` | Implemented | 13/13 | POST /CompanyInfo (Edit) |
| `CounterCreateDto` | Partially implemented | 4/5 | POST /api/platform/counters (Create) |
| `CounterUpdateDto` | Partially implemented | 3/4 | PUT /api/platform/counters/{id:long} (Update) |
| `CurrencyCRUDViewModel` | Partially implemented | 5/9 | POST /Currency (AddEdit) |
| `DefaultIdentityOptionsCRUDViewModel` | Missing form | 1/19 | POST /IdentitySetting (Edit) |
| `DepartmentCRUDViewModel` | Implemented | 3/3 | POST /Department (AddEdit) |
| `DesignationCRUDViewModel` | Implemented | 3/3 | POST /Designation (AddEdit) |
| `DocumentMetadataCreateDto` | Missing form | 1/9 | POST /api/platform/documents (Create) |
| `DocumentMetadataUpdateDto` | Missing form | 1/9 | PUT /api/platform/documents/{id:long} (Update) |
| `EnableAuthenticatorViewModel` | Missing form | 1/3 | POST /Manage (EnableAuthenticator) |
| `ExternalLoginViewModel` | Missing form | 1/1 | POST /Account (ExternalLoginConfirmation) |
| `FacilityCreateDto` | Partially implemented | 7/8 | POST /api/platform/facilities (Create) |
| `FacilityUpdateDto` | Partially implemented | 6/7 | PUT /api/platform/facilities/{id:long} (Update) |
| `ForgotPasswordViewModel` | Partially implemented | 1/1 | POST /Account (ForgotPassword) |
| `HospitalTenantCreateDto` | Partially implemented | 2/5 | POST /api/platform/tenants (Create) |
| `HospitalTenantUpdateDto` | Partially implemented | 2/5 | PUT /api/platform/tenants/{id:long} (Update) |
| `IndexViewModel` | Partially implemented | 2/5 | POST /Manage (Index) |
| `InsuranceCompanyInfoCRUDViewModel` | Partially implemented | 5/6 | POST /InsuranceCompanyInfo (AddEdit) |
| `LoginViewModel` | Implemented | 6/6 | POST /Account (Login) |
| `LoginWith2faViewModel` | Missing form | 1/3 | POST /Account (LoginWith2fa) |
| `LoginWithRecoveryCodeViewModel` | Missing form | 0/1 | POST /Account (LoginWithRecoveryCode) |
| `ManageUserRolesCRUDViewModel` | Implemented | 4/5 | POST /ManageUserRoles (AddEdit) |
| `NotificationTemplateCreateDto` | Partially implemented | 5/6 | POST /api/platform/notification-templates (Create) |
| `NotificationTemplateUpdateDto` | Partially implemented | 4/5 | PUT /api/platform/notification-templates/{id:long} (Update) |
| `NumberingSeriesCreateDto` | Partially implemented | 4/7 | POST /api/platform/numbering-series (Create) |
| `NumberingSeriesUpdateDto` | Partially implemented | 3/6 | PUT /api/platform/numbering-series/{id:long} (Update) |
| `OPDCancelRequest` | Partially implemented | 4/5 | POST /api/checkup/{checkupSummaryId}/cancel (Cancel) |
| `PlatformDepartmentCreateDto` | Partially implemented | 3/5 | POST /api/platform/departments (Create) |
| `PlatformDepartmentUpdateDto` | Partially implemented | 2/4 | PUT /api/platform/departments/{id:long} (Update) |
| `PlatformSettingCreateDto` | Partially implemented | 4/6 | POST /api/platform/settings (Create) |
| `PlatformSettingUpdateDto` | Partially implemented | 3/5 | PUT /api/platform/settings/{id:long} (Update) |
| `RegisterDto` | Implemented | 5/5 | POST /api/account/register (Register) |
| `RemoveLoginViewModel` | Missing form | 0/2 | POST /Manage (RemoveLogin) |
| `ResetPasswordDto` | Partially implemented | 1/1 | PUT /api/admin/users/{id}/reset-password (ResetPassword) |
| `ResetPasswordViewModel` | Implemented | 6/6 | POST /Account (ResetPassword) |
| `RoomCreateDto` | Partially implemented | 4/6 | POST /api/platform/rooms (Create) |
| `RoomUpdateDto` | Partially implemented | 3/5 | PUT /api/platform/rooms/{id:long} (Update) |
| `SMTPEmailSettingViewModel` | Partially implemented | 4/9 | POST /EmailSetting (SMTPEmailSettingAddEdit) |
| `SendGridSettingViewModel` | Missing form | 1/6 | POST /EmailSetting (SendGridSettingAddEdit) |
| `SetPasswordViewModel` | Partially implemented | 2/3 | POST /Manage (SetPassword) |
| `SubDepartmentCRUDViewModel` | Implemented | 4/5 | POST /SubDepartment (AddEdit) |
| `UnitCRUDViewModel` | Implemented | 3/3 | POST /Unit (AddEdit) |
| `UpdateUserJobRoleDto` | Partially implemented | 1/1 | PUT /api/admin/users/{id}/job-role (UpdateJobRole) |
| `UpdateUserPermissionsDto` | Partially implemented | 1/1 | PUT /api/admin/users/{id}/permissions (UpdateUserPermissions) |
| `UpdateUserStatusDto` | Partially implemented | 1/1 | PUT /api/admin/users/{id}/status (UpdateStatus) |
| `UserInfoFromBrowser` | Partially implemented | 3/17 | POST /Account (SaveUserInfoFromBrowser) |
| `UserProfileCRUDViewModel` | Implemented | 27/31 | POST /Account (Register) |
| `WardCreateDto` | Partially implemented | 3/5 | POST /api/platform/wards (Create) |
| `WardUpdateDto` | Partially implemented | 2/4 | PUT /api/platform/wards/{id:long} (Update) |
| `CreateEmployeeDto` | Partially implemented | 15/15 | POST /api/employees (CreateEmployee) |
| `CreateUserForEmployeeDto` | Implemented | 6/6 | POST /api/employees/{id:long}/create-user (CreateUserForEmployee) |
| `UpdateEmployeeDto` | Partially implemented | 15/15 | PUT /api/employees/{id:long} (UpdateEmployee) |
| `QueueIntegrationEventRequestDto` | Missing form | 1/5 | POST /api/phase4/enterprise-intelligence/events/queue (QueueEvent) |

## Patient Administration

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `ApprovePatientMergeRequestDto` | Partially implemented | 2/2 | POST /api/patient-administration/workflow/merge-requests/{mergeRequestId:long}/approve (ApproveMerge) |
| `ConsentRecordCreateDto` | Partially implemented | 2/8 | POST /api/patient-administration/consents (Create) |
| `ConsentRecordUpdateDto` | Partially implemented | 2/7 | PUT /api/patient-administration/consents/{id:long} (Update) |
| `DuplicateDetectionRequestDto` | Partially implemented | 4/6 | POST /api/patient-administration/workflow/duplicates/detect (DetectDuplicates) |
| `PatientAppointmentCRUDViewModel` | Partially implemented | 10/12 | POST /PatientAppointment (AddEditSave) |
| `PatientContactCreateDto` | Partially implemented | 4/9 | POST /api/patient-administration/contacts (Create) |
| `PatientContactUpdateDto` | Partially implemented | 4/8 | PUT /api/patient-administration/contacts/{id:long} (Update) |
| `PatientDuplicateSearchDto` | Partially implemented | 4/6 | POST /api/phase1/opd-revenue-core/patients/duplicate-check (DuplicateCheck) |
| `PatientFeedbackCreateDto` | Partially implemented | 2/4 | POST /api/patient-administration/feedback (Create) |
| `PatientFeedbackUpdateDto` | Partially implemented | 3/6 | PUT /api/patient-administration/feedback/{id:long} (Update) |
| `PatientInfoCRUDViewModel` | Implemented | 29/30 | POST /PatientInfo (AddEdit) |
| `PatientMergeRequestCreateDto` | Missing form | 1/3 | POST /api/patient-administration/merge-requests (Create) |
| `PatientMergeRequestUpdateDto` | Partially implemented | 4/5 | PUT /api/patient-administration/merge-requests/{id:long} (Update) |
| `PatientPortalAccountCreateDto` | Missing form | 1/4 | POST /api/patient-engagement/portal-accounts (Create) |
| `PatientPortalAccountUpdateDto` | Missing form | 1/5 | PUT /api/patient-engagement/portal-accounts/{id:long} (Update) |
| `PatientRecordCreateDto` | Partially implemented | 6/11 | POST /api/patient-administration/patients (Create) |
| `PatientRecordUpdateDto` | Partially implemented | 6/10 | PUT /api/patient-administration/patients/{id:long} (Update) |
| `PatientTimelineEventCreateDto` | Partially implemented | 3/7 | POST /api/patient-administration/timeline-events (Create) |
| `PatientTimelineEventUpdateDto` | Partially implemented | 3/6 | PUT /api/patient-administration/timeline-events/{id:long} (Update) |
| `QueueTicketActionRequestDto` | Partially implemented | 2/2 | POST /api/patient-administration/workflow/queue-tickets/{queueTicketId:long}/call (CallQueue) |
| `QueueTicketCreateDto` | Partially implemented | 2/7 | POST /api/patient-administration/queue-tickets (Create) |
| `QueueTicketStatusUpdateDto` | Partially implemented | 2/2 | PATCH /api/phase1/opd-revenue-core/queue/{ticketId:long}/status (UpdateQueueStatus) |
| `QueueTicketUpdateDto` | Partially implemented | 3/8 | PUT /api/patient-administration/queue-tickets/{id:long} (Update) |
| `RegisterPatientWorkflowRequestDto` | Partially implemented | 9/20 | POST /api/patient-administration/workflow/registrations (Register) |
| `RejectPatientMergeRequestDto` | Missing form | 0/2 | POST /api/patient-administration/workflow/merge-requests/{mergeRequestId:long}/reject (RejectMerge) |
| `SignConsentRequestDto` | Missing form | 1/3 | POST /api/patient-administration/workflow/consents/{consentRecordId:long}/sign (SignConsent) |

## Clinical/OPD

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AllergyCreateDto` | Partially implemented | 2/7 | POST /api/clinical/allergies (Create) |
| `AllergyUpdateDto` | Partially implemented | 2/6 | PUT /api/clinical/allergies/{id:long} (Update) |
| `CarePlanCreateDto` | Partially implemented | 3/6 | POST /api/clinical/care-plans (Create) |
| `CarePlanUpdateDto` | Partially implemented | 3/5 | PUT /api/clinical/care-plans/{id:long} (Update) |
| `ChangeClinicalOrderStatusRequestDto` | Partially implemented | 2/4 | POST /api/clinical/workflow/orders/{clinicalOrderId:long}/status (ChangeOrderStatus) |
| `CheckupMedicineDetailsCRUDViewModel` | Partially implemented | 7/11 | POST /CheckupMedicineDetails (AddEdit) |
| `CheckupSummaryCRUDViewModel` | Partially implemented | 27/31 | POST /api/checkups (Create) |
| `ClinicalAlertCreateDto` | Partially implemented | 4/7 | POST /api/clinical/alerts (Create) |
| `ClinicalAlertUpdateDto` | Partially implemented | 4/8 | PUT /api/clinical/alerts/{id:long} (Update) |
| `ClinicalEncounterCreateDto` | Partially implemented | 4/11 | POST /api/clinical/encounters (Create) |
| `ClinicalEncounterUpdateDto` | Partially implemented | 4/10 | PUT /api/clinical/encounters/{id:long} (Update) |
| `ClinicalNoteTemplateCreateDto` | Partially implemented | 3/5 | POST /api/clinical/note-templates (Create) |
| `ClinicalNoteTemplateUpdateDto` | Partially implemented | 3/5 | PUT /api/clinical/note-templates/{id:long} (Update) |
| `ClinicalOrderCreateDto` | Partially implemented | 4/10 | POST /api/clinical/orders (Create) |
| `ClinicalOrderUpdateDto` | Partially implemented | 4/9 | PUT /api/clinical/orders/{id:long} (Update) |
| `DiagnosisCreateDto` | Partially implemented | 3/8 | POST /api/clinical/diagnoses (Create) |
| `DiagnosisUpdateDto` | Partially implemented | 3/7 | PUT /api/clinical/diagnoses/{id:long} (Update) |
| `DoctorsInfoCRUDViewModel` | Implemented | 21/22 | POST /DoctorsInfo (Add) |
| `ImmunizationRecordCreateDto` | Missing form | 0/7 | POST /api/clinical/immunizations (Create) |
| `ImmunizationRecordUpdateDto` | Missing form | 0/6 | PUT /api/clinical/immunizations/{id:long} (Update) |
| `ManageCheckupViewModel` | Missing form | 0/8 | POST /CheckupSummary (AddEdit) |
| `ManageDoctorInfoViewModel` | Missing form | 0/2 | POST /DoctorsInfo (Edit) |
| `MedicationOrderCreateDto` | Partially implemented | 5/11 | POST /api/clinical/medication-orders (Create) |
| `MedicationOrderUpdateDto` | Partially implemented | 5/10 | PUT /api/clinical/medication-orders/{id:long} (Update) |
| `PrescriptionCreateDto` | Partially implemented | 2/7 | POST /api/clinical/prescriptions (Create) |
| `PrescriptionUpdateDto` | Partially implemented | 2/6 | PUT /api/clinical/prescriptions/{id:long} (Update) |
| `ProblemListItemCreateDto` | Partially implemented | 4/7 | POST /api/clinical/problems (Create) |
| `ProblemListItemUpdateDto` | Partially implemented | 4/6 | PUT /api/clinical/problems/{id:long} (Update) |
| `ReferralCreateDto` | Partially implemented | 3/8 | POST /api/clinical/referrals (Create) |
| `ReferralUpdateDto` | Partially implemented | 3/7 | PUT /api/clinical/referrals/{id:long} (Update) |
| `ReleaseClinicalOrderResultRequestDto` | Partially implemented | 2/10 | POST /api/clinical/workflow/orders/{clinicalOrderId:long}/results/release (ReleaseOrderResult) |
| `SignPrescriptionRequestDto` | Missing form | 0/1 | POST /api/clinical/workflow/prescriptions/{prescriptionId:long}/sign (SignPrescription) |
| `StartOpdEncounterWorkflowRequestDto` | Partially implemented | 6/12 | POST /api/clinical/workflow/opd-encounters (StartOpdEncounter) |
| `VitalSignCreateDto` | Partially implemented | 2/13 | POST /api/clinical/vitals (Create) |
| `VitalSignUpdateDto` | Partially implemented | 2/12 | PUT /api/clinical/vitals/{id:long} (Update) |
| `VitalSignsCRUDViewModel` | Partially implemented | 3/6 | POST /MedicineLabel (AddEdit) |

## Emergency

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `EmergencyEncounterCreateDto` | Missing form | 1/11 | POST /api/emergency/encounters (Create) |
| `EmergencyEncounterUpdateDto` | Missing form | 1/10 | PUT /api/emergency/encounters/{id:long} (Update) |
| `ObservationBedCreateDto` | Partially implemented | 2/8 | POST /api/emergency/observation-beds (Create) |
| `ObservationBedUpdateDto` | Partially implemented | 2/7 | PUT /api/emergency/observation-beds/{id:long} (Update) |
| `TraumaResuscitationEventCreateDto` | Partially implemented | 3/9 | POST /api/emergency/resuscitation-events (Create) |
| `TraumaResuscitationEventUpdateDto` | Partially implemented | 3/8 | PUT /api/emergency/resuscitation-events/{id:long} (Update) |
| `TriageRecordCreateDto` | Partially implemented | 2/15 | POST /api/emergency/triage (Create) |
| `TriageRecordUpdateDto` | Partially implemented | 2/14 | PUT /api/emergency/triage/{id:long} (Update) |

## IPD/Inpatient

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AdmissionCreateDto` | Partially implemented | 4/11 | POST /api/inpatient/admissions (Create) |
| `AdmissionUpdateDto` | Partially implemented | 4/10 | PUT /api/inpatient/admissions/{id:long} (Update) |
| `AdmitPatientRequestDto` | Partially implemented | 2/8 | POST /api/inpatient/workflow/admissions (Admit) |
| `BedAllotmentsCRUDViewModel` | Partially implemented | 4/8 | POST /BedAllotments (AddEdit) |
| `BedCategoriesCRUDViewModel` | Partially implemented | 3/3 | POST /BedCategories (AddEdit) |
| `BedCreateDto` | Partially implemented | 2/7 | POST /api/inpatient/beds (Create) |
| `BedTransferCreateDto` | Partially implemented | 2/8 | POST /api/inpatient/bed-transfers (Create) |
| `BedTransferRequestDto` | Partially implemented | 2/4 | POST /api/phase3/hospital-operations/admissions/{admissionId:long}/bed-transfer (TransferBed) |
| `BedTransferUpdateDto` | Partially implemented | 2/7 | PUT /api/inpatient/bed-transfers/{id:long} (Update) |
| `BedUpdateDto` | Partially implemented | 2/7 | PUT /api/inpatient/beds/{id:long} (Update) |
| `CaseSheetCreateDto` | Missing form | 1/6 | POST /api/inpatient/case-sheets (Create) |
| `CaseSheetUpdateDto` | Missing form | 1/4 | PUT /api/inpatient/case-sheets/{id:long} (Update) |
| `CompleteDischargeClearanceRequestDto` | Missing form | 1/4 | POST /api/inpatient/workflow/admissions/{admissionId:long}/discharge-clearances (CompleteClearance) |
| `DietOrderCreateDto` | Missing form | 1/8 | POST /api/inpatient/diet-orders (Create) |
| `DietOrderUpdateDto` | Missing form | 1/6 | PUT /api/inpatient/diet-orders/{id:long} (Update) |
| `DischargeSummaryCreateDto` | Partially implemented | 2/9 | POST /api/inpatient/discharge-summaries (Create) |
| `DischargeSummaryUpdateDto` | Partially implemented | 2/7 | PUT /api/inpatient/discharge-summaries/{id:long} (Update) |
| `FinalizeDischargeRequestDto` | Missing form | 1/7 | POST /api/inpatient/workflow/admissions/{admissionId:long}/discharge (FinalizeDischarge) |
| `MedicationAdministrationRecordCreateDto` | Partially implemented | 4/11 | POST /api/inpatient/medication-administration (Create) |
| `MedicationAdministrationRecordUpdateDto` | Partially implemented | 4/9 | PUT /api/inpatient/medication-administration/{id:long} (Update) |
| `MedicationAdministrationWorkflowRequestDto` | Missing form | 1/5 | POST /api/inpatient/workflow/medication-administration/{medicationAdministrationRecordId:long}/events (MedicationAdministration) |
| `NursingNoteCreateDto` | Missing form | 0/6 | POST /api/inpatient/nursing-notes (Create) |
| `NursingNoteUpdateDto` | Missing form | 0/4 | PUT /api/inpatient/nursing-notes/{id:long} (Update) |
| `TransferBedRequestDto` | Partially implemented | 2/3 | POST /api/inpatient/workflow/admissions/{admissionId:long}/transfer-bed (TransferBed) |
| `WardRoundCreateDto` | Missing form | 0/7 | POST /api/inpatient/ward-rounds (Create) |
| `WardRoundUpdateDto` | Missing form | 0/5 | PUT /api/inpatient/ward-rounds/{id:long} (Update) |

## Laboratory

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AmendLabResultWorkflowRequestDto` | Missing form | 0/4 | POST /api/laboratory/workflow/results/{labResultId:long}/amend (Amend) |
| `AnalyzerIntegrationCreateDto` | Partially implemented | 2/6 | POST /api/laboratory/analyzers (Create) |
| `AnalyzerIntegrationUpdateDto` | Partially implemented | 2/6 | PUT /api/laboratory/analyzers/{id:long} (Update) |
| `CollectSampleWorkflowRequestDto` | Partially implemented | 2/3 | POST /api/laboratory/workflow/orders/{labOrderId:long}/samples/collect (CollectSample) |
| `EnterLabResultWorkflowRequestDto` | Missing form | 1/8 | POST /api/laboratory/workflow/orders/{labOrderId:long}/results (EnterResult) |
| `LabOrderCreateDto` | Partially implemented | 5/11 | POST /api/laboratory/orders (Create) |
| `LabOrderUpdateDto` | Partially implemented | 5/10 | PUT /api/laboratory/orders/{id:long} (Update) |
| `LabReportCreateDto` | Missing form | 1/7 | POST /api/laboratory/reports (Create) |
| `LabReportReferenceDataCRUDViewModel` | Partially implemented | 2/7 | POST /LabReportReferenceData (AddEditSave) |
| `LabReportUpdateDto` | Missing form | 1/6 | PUT /api/laboratory/reports/{id:long} (Update) |
| `LabResultCreateDto` | Partially implemented | 2/11 | POST /api/laboratory/results (Create) |
| `LabResultUpdateDto` | Partially implemented | 2/10 | PUT /api/laboratory/results/{id:long} (Update) |
| `LabTestCatalogItemCreateDto` | Partially implemented | 5/8 | POST /api/laboratory/catalog (Create) |
| `LabTestCatalogItemUpdateDto` | Partially implemented | 5/8 | PUT /api/laboratory/catalog/{id:long} (Update) |
| `LabTestCategoriesCRUDViewModel` | Partially implemented | 3/3 | POST /LabTestCategories (AddEdit) |
| `LabTestConfigurationCRUDViewModel` | Partially implemented | 2/9 | POST /LabTestConfiguration (AddEdit) |
| `LabTestNameCRUDViewModel` | Partially implemented | 4/5 | POST /LabTestName (AddEditSave) |
| `LabTestResultCRUDViewModel` | Partially implemented | 3/10 | POST /LabTestResult (AddEditSave) |
| `LabTestsCRUDViewModel` | Partially implemented | 5/9 | POST /LabTests (AddEdit) |
| `ManagePatientTestViewModel` | Missing form | 0/4 | POST /PatientTest (AddEdit) |
| `PatientTestDetailCRUDViewModel` | Partially implemented | 5/8 | POST /PatientTest (SavePatientTestDetail) |
| `PatientTestResultUpdateViewModel` | Partially implemented | 3/5 | POST /PatientTest (UpdatePatientTestDetailDB) |
| `QualityControlRecordCreateDto` | Partially implemented | 3/7 | POST /api/laboratory/quality-control (Create) |
| `QualityControlRecordUpdateDto` | Partially implemented | 3/7 | PUT /api/laboratory/quality-control/{id:long} (Update) |
| `RejectSampleWorkflowRequestDto` | Missing form | 0/2 | POST /api/laboratory/workflow/samples/{sampleCollectionId:long}/reject (RejectSample) |
| `ResultVerificationCreateDto` | Missing form | 1/8 | POST /api/laboratory/verifications (Create) |
| `ResultVerificationUpdateDto` | Missing form | 1/7 | PUT /api/laboratory/verifications/{id:long} (Update) |
| `SampleCollectionCreateDto` | Partially implemented | 3/7 | POST /api/laboratory/samples (Create) |
| `SampleCollectionUpdateDto` | Partially implemented | 3/6 | PUT /api/laboratory/samples/{id:long} (Update) |
| `VerifyLabResultWorkflowRequestDto` | Missing form | 1/10 | POST /api/laboratory/workflow/orders/{labOrderId:long}/verify (Verify) |

## Radiology

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AcknowledgeCriticalFindingRequestDto` | Missing form | 1/3 | POST /api/radiology/workflow/critical-findings/{alertId:long}/acknowledge (AcknowledgeCriticalFinding) |
| `CriticalFindingAlertCreateDto` | Partially implemented | 2/10 | POST /api/radiology/critical-findings (Create) |
| `CriticalFindingAlertUpdateDto` | Partially implemented | 2/9 | PUT /api/radiology/critical-findings/{id:long} (Update) |
| `ImagingCatalogItemCreateDto` | Partially implemented | 5/10 | POST /api/radiology/catalog (Create) |
| `ImagingCatalogItemUpdateDto` | Partially implemented | 4/9 | PUT /api/radiology/catalog/{id:long} (Update) |
| `RadiologyContrastAdministrationCreateDto` | Missing form | 1/7 | POST /api/radiology/contrast-administrations (Create) |
| `RadiologyContrastAdministrationUpdateDto` | Missing form | 1/6 | PUT /api/radiology/contrast-administrations/{id:long} (Update) |
| `RadiologyOrderCreateDto` | Partially implemented | 6/13 | POST /api/radiology/orders (Create) |
| `RadiologyOrderUpdateDto` | Partially implemented | 5/11 | PUT /api/radiology/orders/{id:long} (Update) |
| `RadiologyReportCreateDto` | Partially implemented | 4/11 | POST /api/radiology/reports (Create) |
| `RadiologyReportTemplateCreateDto` | Partially implemented | 4/6 | POST /api/radiology/report-templates (Create) |
| `RadiologyReportTemplateUpdateDto` | Partially implemented | 4/5 | PUT /api/radiology/report-templates/{id:long} (Update) |
| `RadiologyReportUpdateDto` | Partially implemented | 4/9 | PUT /api/radiology/reports/{id:long} (Update) |
| `RadiologyRoomCreateDto` | Partially implemented | 5/5 | POST /api/radiology/rooms (Create) |
| `RadiologyRoomUpdateDto` | Partially implemented | 4/4 | PUT /api/radiology/rooms/{id:long} (Update) |
| `RadiologyScheduleSlotCreateDto` | Partially implemented | 3/8 | POST /api/radiology/schedule-slots (Create) |
| `RadiologyScheduleSlotUpdateDto` | Partially implemented | 3/7 | PUT /api/radiology/schedule-slots/{id:long} (Update) |
| `RadiologyStudyCreateDto` | Missing form | 0/8 | POST /api/radiology/studies (Create) |
| `RadiologyStudyUpdateDto` | Missing form | 0/6 | PUT /api/radiology/studies/{id:long} (Update) |
| `RaiseCriticalFindingRequestDto` | Missing form | 1/5 | POST /api/radiology/workflow/orders/{orderId:long}/critical-findings (RaiseCriticalFinding) |
| `RegisterRadiologyStudyRequestDto` | Missing form | 0/6 | POST /api/radiology/workflow/orders/{orderId:long}/study (RegisterStudy) |
| `ScheduleRadiologyOrderRequestDto` | Missing form | 1/5 | POST /api/radiology/workflow/orders/{orderId:long}/schedule (Schedule) |
| `VerifyRadiologyReportRequestDto` | Partially implemented | 3/11 | POST /api/radiology/workflow/orders/{orderId:long}/reports/verify (VerifyReport) |

## Pharmacy

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `PharmacyUnitConversionRequestDto` | Partially implemented | 2/3 | POST /api/pharmacy/workflow/unit-conversion (ConvertUnit) |
| `ControlledDrugRegisterEntryCreateDto` | Partially implemented | 2/10 | POST /api/pharmacy/controlled-drug-register (Create) |
| `ControlledDrugRegisterEntryUpdateDto` | Partially implemented | 2/9 | PUT /api/pharmacy/controlled-drug-register/{id:long} (Update) |
| `DrugInteractionRuleCreateDto` | Partially implemented | 2/5 | POST /api/pharmacy/drug-interactions (Create) |
| `DrugInteractionRuleUpdateDto` | Partially implemented | 2/5 | PUT /api/pharmacy/drug-interactions/{id:long} (Update) |
| `MedicineCategoriesCRUDViewModel` | Partially implemented | 3/3 | POST /MedicineCategories (AddEdit) |
| `MedicineManufactureCRUDViewModel` | Partially implemented | 4/4 | POST /MedicineManufacture (AddEdit) |
| `MedicinesCRUDViewModel` | Partially implemented | 9/22 | POST /Medicines (AddEdit) |
| `PharmacyExpiryActionCreateDto` | Partially implemented | 3/8 | POST /api/pharmacy/expiry-actions (Create) |
| `PharmacyExpiryActionUpdateDto` | Partially implemented | 3/6 | PUT /api/pharmacy/expiry-actions/{id:long} (Update) |
| `PharmacyGoodsReceiptCreateDto` | Partially implemented | 3/7 | POST /api/pharmacy/goods-receipts (Create) |
| `PharmacyGoodsReceiptLineCreateDto` | Partially implemented | 2/9 | POST /api/pharmacy/goods-receipt-lines (Create) |
| `PharmacyGoodsReceiptLineUpdateDto` | Partially implemented | 2/8 | PUT /api/pharmacy/goods-receipt-lines/{id:long} (Update) |
| `PharmacyGoodsReceiptUpdateDto` | Partially implemented | 3/7 | PUT /api/pharmacy/goods-receipts/{id:long} (Update) |
| `PharmacyItemCreateDto` | Partially implemented | 7/14 | POST /api/pharmacy/items (Create) |
| `PharmacyItemUpdateDto` | Partially implemented | 7/14 | PUT /api/pharmacy/items/{id:long} (Update) |
| `PharmacyPaymentCreateDto` | Partially implemented | 3/6 | POST /api/pharmacy/payments (Create) |
| `PharmacyPaymentUpdateDto` | Partially implemented | 3/5 | PUT /api/pharmacy/payments/{id:long} (Update) |
| `PharmacyPurchaseOrderCreateDto` | Partially implemented | 4/8 | POST /api/pharmacy/purchase-orders (Create) |
| `PharmacyPurchaseOrderLineCreateDto` | Partially implemented | 3/8 | POST /api/pharmacy/purchase-order-lines (Create) |
| `PharmacyPurchaseOrderLineUpdateDto` | Partially implemented | 3/7 | PUT /api/pharmacy/purchase-order-lines/{id:long} (Update) |
| `PharmacyPurchaseOrderUpdateDto` | Partially implemented | 4/8 | PUT /api/pharmacy/purchase-orders/{id:long} (Update) |
| `PharmacySaleCreateDto` | Partially implemented | 6/11 | POST /api/pharmacy/sales (Create) |
| `PharmacySaleLineCreateDto` | Partially implemented | 7/14 | POST /api/pharmacy/sale-lines (Create) |
| `PharmacySaleLineUpdateDto` | Partially implemented | 7/13 | PUT /api/pharmacy/sale-lines/{id:long} (Update) |
| `PharmacySaleUpdateDto` | Partially implemented | 6/11 | PUT /api/pharmacy/sales/{id:long} (Update) |
| `PharmacyStockAdjustmentCreateDto` | Partially implemented | 2/7 | POST /api/pharmacy/stock-adjustments (Create) |
| `PharmacyStockAdjustmentUpdateDto` | Partially implemented | 2/6 | PUT /api/pharmacy/stock-adjustments/{id:long} (Update) |
| `PharmacyStockLedgerEntryCreateDto` | Partially implemented | 2/9 | POST /api/pharmacy/stock-ledger (Create) |
| `PharmacyStockLedgerEntryUpdateDto` | Partially implemented | 2/8 | PUT /api/pharmacy/stock-ledger/{id:long} (Update) |
| `PharmacyStockLotCreateDto` | Partially implemented | 4/9 | POST /api/pharmacy/stock-lots (Create) |
| `PharmacyStockLotUpdateDto` | Partially implemented | 4/8 | PUT /api/pharmacy/stock-lots/{id:long} (Update) |
| `PharmacySupplierCreateDto` | Partially implemented | 3/6 | POST /api/pharmacy/suppliers (Create) |
| `PharmacySupplierUpdateDto` | Partially implemented | 3/6 | PUT /api/pharmacy/suppliers/{id:long} (Update) |
| `PostPharmacyReturnRequestDto` | Partially implemented | 3/6 | POST /api/pharmacy/workflow/sales/returns/post (PostReturn) |
| `PostPharmacySaleRequestDto` | Partially implemented | 4/8 | POST /api/pharmacy/workflow/sales/post (PostSale) |
| `PrescriptionDispenseCreateDto` | Partially implemented | 2/7 | POST /api/pharmacy/dispenses (Create) |
| `PrescriptionDispenseLineCreateDto` | Missing form | 1/9 | POST /api/pharmacy/dispense-lines (Create) |
| `PrescriptionDispenseLineUpdateDto` | Missing form | 1/8 | PUT /api/pharmacy/dispense-lines/{id:long} (Update) |
| `PrescriptionDispenseUpdateDto` | Partially implemented | 2/6 | PUT /api/pharmacy/dispenses/{id:long} (Update) |

## Billing/Insurance/Revenue Cycle

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AccountsReceivableEntryCreateDto` | Partially implemented | 3/8 | POST /api/billing/accounts-receivable (Create) |
| `AccountsReceivableEntryUpdateDto` | Missing form | 1/5 | PUT /api/billing/accounts-receivable/{id:long} (Update) |
| `BillingInvoiceCreateDto` | Partially implemented | 10/17 | POST /api/billing/invoices (Create) |
| `BillingInvoiceLineCreateDto` | Partially implemented | 7/12 | POST /api/billing/invoice-lines (Create) |
| `BillingInvoiceLineUpdateDto` | Partially implemented | 6/11 | PUT /api/billing/invoice-lines/{id:long} (Update) |
| `BillingInvoiceUpdateDto` | Partially implemented | 8/15 | PUT /api/billing/invoices/{id:long} (Update) |
| `BillingPackageItemCreateDto` | Partially implemented | 2/5 | POST /api/billing/package-items (Create) |
| `BillingPackageItemUpdateDto` | Partially implemented | 2/4 | PUT /api/billing/package-items/{id:long} (Update) |
| `BillingPaymentCreateDto` | Partially implemented | 4/9 | POST /api/billing/payments (Create) |
| `BillingPaymentUpdateDto` | Partially implemented | 3/7 | PUT /api/billing/payments/{id:long} (Update) |
| `BillingRefundCreateDto` | Partially implemented | 6/8 | POST /api/billing/refunds (Create) |
| `BillingRefundUpdateDto` | Partially implemented | 5/6 | PUT /api/billing/refunds/{id:long} (Update) |
| `BillingServiceItemCreateDto` | Partially implemented | 5/11 | POST /api/billing/service-items (Create) |
| `BillingServiceItemUpdateDto` | Partially implemented | 4/10 | PUT /api/billing/service-items/{id:long} (Update) |
| `CashierSessionCreateDto` | Partially implemented | 4/10 | POST /api/billing/cashier-sessions (Create) |
| `CashierSessionUpdateDto` | Partially implemented | 3/7 | PUT /api/billing/cashier-sessions/{id:long} (Update) |
| `CounterClosingToggleDto` | Missing form | 1/1 | PUT /{id:int}/counter-closing (SetCounterClosing) |
| `CreateInsuranceClaimRequestDto` | Partially implemented | 2/5 | POST /api/billing/claims-workflow/claims (CreateClaim) |
| `DecideClaimAppealRequestDto` | Partially implemented | 2/5 | POST /api/billing/claims-workflow/appeals/{appealId:long}/decision (DecideAppeal) |
| `DecideInsuranceClaimRequestDto` | Missing form | 1/5 | POST /api/billing/claims-workflow/claims/{claimId:long}/decision (DecideClaim) |
| `DecidePreAuthorizationDto` | Partially implemented | 2/5 | POST /api/billing/claims-workflow/pre-authorizations/{preAuthorizationId:long}/decision (DecidePreAuthorization) |
| `DiscountApprovalCreateDto` | Partially implemented | 4/8 | POST /api/billing/discount-approvals (Create) |
| `DiscountApprovalUpdateDto` | Partially implemented | 3/6 | PUT /api/billing/discount-approvals/{id:long} (Update) |
| `InsuranceClaimCreateDto` | Partially implemented | 2/11 | POST /api/billing/claims (Create) |
| `InsuranceClaimUpdateDto` | Missing form | 1/8 | PUT /api/billing/claims/{id:long} (Update) |
| `ManagePaymentsViewModel` | Implemented | 4/4 | POST /Payments (AddEdit) |
| `OpenClaimAppealRequestDto` | Partially implemented | 2/3 | POST /api/billing/claims-workflow/claims/{claimId:long}/appeals (OpenAppeal) |
| `PayerContractCreateDto` | Partially implemented | 2/9 | POST /api/billing/payer-contracts (Create) |
| `PayerContractUpdateDto` | Partially implemented | 2/8 | PUT /api/billing/payer-contracts/{id:long} (Update) |
| `PaymentCategoriesCRUDViewModel` | Implemented | 5/5 | POST /PaymentCategories (AddEdit) |
| `PaymentCategorySaveDto` | Implemented | 6/6 | POST (attribute route not explicit) (Create) |
| `PaymentModeHistoryCRUDViewModel` | Implemented | 5/5 | POST /Payments (SavePaymentModeHistory) |
| `PaymentsDetailsCRUDViewModel` | Partially implemented | 6/9 | POST /Payments (UpdatePaymentsDetailsDB) |
| `RefundRequestDTO` | Partially implemented | 2/2 | POST /api/finance/refund/revenue/{voucherId} (RefundRevenue) |
| `RequestPreAuthorizationDto` | Partially implemented | 2/7 | POST /api/billing/claims-workflow/pre-authorizations (RequestPreAuthorization) |
| `SubmitClaimAppealRequestDto` | Missing form | 1/2 | POST /api/billing/claims-workflow/appeals/{appealId:long}/submit (SubmitAppeal) |
| `SubmitInsuranceClaimRequestDto` | Missing form | 1/3 | POST /api/billing/claims-workflow/claims/{claimId:long}/submit (SubmitClaim) |

## Finance

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `BankReconciliationCreateDto` | Partially implemented | 3/6 | POST /api/finance/bank-reconciliations (CreateBankReconciliation) |
| `BankReconciliationUpdateDto` | Missing form | 1/4 | PUT /api/finance/bank-reconciliations/{id:guid} (UpdateBankReconciliation) |
| `ChartOfAccountDto` | Implemented | 8/8 | POST /api/ChartOfAccount (Add) |
| `CloseFinancialPeriodDto` | Missing form | 0/1 | POST /api/finance/financial-periods/{id:guid}/close (CloseFinancialPeriod) |
| `CreateRevenueDto` | Partially implemented | 5/7 | POST /api/RevenueVoucher (Create) |
| `DoctorShareAuditCaseCreateDto` | Partially implemented | 5/12 | POST /api/finance/doctor-share-audit/cases (CreateDoctorShareAuditCase) |
| `DoctorShareAuditCaseUpdateDto` | Partially implemented | 2/2 | PUT /api/finance/doctor-share-audit/cases/{id:guid} (UpdateDoctorShareAuditCase) |
| `ExpenseCategoriesCRUDViewModel` | Partially implemented | 3/3 | POST /ExpenseCategories (AddEdit) |
| `ExpenseVoucherDto` | Implemented | 11/11 | POST /api/ExpenseVoucher (Create) |
| `ExpensesCRUDViewModel` | Partially implemented | 2/3 | POST /Expenses (AddEdit) |
| `FinanceBudgetCreateDto` | Partially implemented | 4/7 | POST /api/finance/budgets (CreateBudget) |
| `FinanceBudgetLineCreateDto` | Partially implemented | 2/6 | POST /api/finance/budgets/lines (AddBudgetLine) |
| `FinanceControlAccountCreateDto` | Partially implemented | 5/6 | POST /api/finance/control-accounts (CreateControlAccount) |
| `FinanceControlAccountUpdateDto` | Partially implemented | 5/5 | PUT /api/finance/control-accounts/{id:guid} (UpdateControlAccount) |
| `FinanceEntityTypeDto` | Partially implemented | 6/7 | POST /api/FinanceEntityType (Create) |
| `FinancePostingBatchCreateDto` | Partially implemented | 4/9 | POST /api/finance/posting-batches (CreatePostingBatch) |
| `FinancePostingRuleCreateDto` | Partially implemented | 3/8 | POST /api/finance/posting-rules (CreatePostingRule) |
| `FinancePostingRuleUpdateDto` | Partially implemented | 3/7 | PUT /api/finance/posting-rules/{id:guid} (UpdatePostingRule) |
| `FinanceSourceTransactionLinkCreateDto` | Partially implemented | 4/10 | POST /api/finance/source-transactions (CreateSourceTransactionLink) |
| `FinanceSourceTransactionLinkUpdateDto` | Partially implemented | 3/6 | PUT /api/finance/source-transactions/{id:guid} (UpdateSourceTransactionLink) |
| `FinanceSourceTransactionPostDto` | Partially implemented | 4/10 | POST /api/finance/source-transactions/post (PostSourceTransaction) |
| `FinancialPeriodCreateDto` | Partially implemented | 2/5 | POST /api/finance/financial-periods (CreateFinancialPeriod) |
| `JournalEntryDto` | Partially implemented | 8/8 | POST /api/Journal (Create) |
| `ReceiptVoucherDto` | Partially implemented | 8/10 | POST /api/finance/receipt-vouchers (Create) |
| `RevenueLeakageCaseCreateDto` | Partially implemented | 7/14 | POST /api/finance/revenue-leakage/cases (CreateRevenueLeakageCase) |
| `RevenueLeakageCaseUpdateDto` | Partially implemented | 3/4 | PUT /api/finance/revenue-leakage/cases/{id:guid} (UpdateRevenueLeakageCase) |
| `RevenueLeakageControlRunRequestDto` | Partially implemented | 3/5 | POST /api/finance/revenue-leakage/run-controls (RunRevenueLeakageControls) |
| `RevenuePostDto` | Partially implemented | 4/4 | POST /api/RevenueVoucher/{id:guid}/post (Post) |
| `TaxRateDto` | Partially implemented | 6/6 | POST /api/TaxRate (Create) |

## Inventory/Procurement

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `InventoryGoodsReceiptCreateDto` | Partially implemented | 2/8 | POST /api/inventory/goods-receipts (Create) |
| `InventoryGoodsReceiptLineCreateDto` | Missing form | 1/9 | POST /api/inventory/goods-receipt-lines (Create) |
| `InventoryGoodsReceiptLineUpdateDto` | Missing form | 1/8 | PUT /api/inventory/goods-receipt-lines/{id:long} (Update) |
| `InventoryGoodsReceiptUpdateDto` | Partially implemented | 2/7 | PUT /api/inventory/goods-receipts/{id:long} (Update) |
| `InventoryIssueCreateDto` | Partially implemented | 3/8 | POST /api/inventory/issues (Create) |
| `InventoryIssueLineCreateDto` | Missing form | 1/5 | POST /api/inventory/issue-lines (Create) |
| `InventoryIssueLineUpdateDto` | Missing form | 1/4 | PUT /api/inventory/issue-lines/{id:long} (Update) |
| `InventoryIssueUpdateDto` | Partially implemented | 3/7 | PUT /api/inventory/issues/{id:long} (Update) |
| `InventoryItemCreateDto` | Partially implemented | 5/13 | POST /api/inventory/items (Create) |
| `InventoryItemUpdateDto` | Partially implemented | 4/12 | PUT /api/inventory/items/{id:long} (Update) |
| `InventoryPurchaseOrderCreateDto` | Partially implemented | 5/10 | POST /api/inventory/purchase-orders (Create) |
| `InventoryPurchaseOrderLineCreateDto` | Partially implemented | 3/7 | POST /api/inventory/purchase-order-lines (Create) |
| `InventoryPurchaseOrderLineUpdateDto` | Partially implemented | 3/6 | PUT /api/inventory/purchase-order-lines/{id:long} (Update) |
| `InventoryPurchaseOrderUpdateDto` | Partially implemented | 5/9 | PUT /api/inventory/purchase-orders/{id:long} (Update) |
| `InventoryRequisitionCreateDto` | Partially implemented | 4/9 | POST /api/inventory/requisitions (Create) |
| `InventoryRequisitionLineCreateDto` | Missing form | 1/6 | POST /api/inventory/requisition-lines (Create) |
| `InventoryRequisitionLineUpdateDto` | Missing form | 1/5 | PUT /api/inventory/requisition-lines/{id:long} (Update) |
| `InventoryRequisitionUpdateDto` | Partially implemented | 4/7 | PUT /api/inventory/requisitions/{id:long} (Update) |
| `InventoryReturnCreateDto` | Partially implemented | 2/7 | POST /api/inventory/returns (Create) |
| `InventoryReturnLineCreateDto` | Missing form | 1/5 | POST /api/inventory/return-lines (Create) |
| `InventoryReturnLineUpdateDto` | Missing form | 1/4 | PUT /api/inventory/return-lines/{id:long} (Update) |
| `InventoryReturnUpdateDto` | Partially implemented | 2/6 | PUT /api/inventory/returns/{id:long} (Update) |
| `InventoryStockCountCreateDto` | Partially implemented | 3/6 | POST /api/inventory/stock-counts (Create) |
| `InventoryStockCountLineCreateDto` | Missing form | 0/7 | POST /api/inventory/stock-count-lines (Create) |
| `InventoryStockCountLineUpdateDto` | Missing form | 0/6 | PUT /api/inventory/stock-count-lines/{id:long} (Update) |
| `InventoryStockCountUpdateDto` | Partially implemented | 3/5 | PUT /api/inventory/stock-counts/{id:long} (Update) |
| `InventoryStockLedgerEntryCreateDto` | Partially implemented | 2/12 | POST /api/inventory/stock-ledger (Create) |
| `InventoryStockLedgerEntryUpdateDto` | Missing form | 1/9 | PUT /api/inventory/stock-ledger/{id:long} (Update) |
| `InventoryStockLotCreateDto` | Partially implemented | 4/9 | POST /api/inventory/stock-lots (Create) |
| `InventoryStockLotUpdateDto` | Partially implemented | 3/7 | PUT /api/inventory/stock-lots/{id:long} (Update) |
| `InventoryStoreCreateDto` | Partially implemented | 4/6 | POST /api/inventory/stores (Create) |
| `InventoryStoreUpdateDto` | Partially implemented | 3/5 | PUT /api/inventory/stores/{id:long} (Update) |
| `InventorySupplierCreateDto` | Partially implemented | 4/7 | POST /api/inventory/suppliers (Create) |
| `InventorySupplierUpdateDto` | Partially implemented | 4/6 | PUT /api/inventory/suppliers/{id:long} (Update) |
| `InventoryTransferCreateDto` | Missing form | 1/6 | POST /api/inventory/transfers (Create) |
| `InventoryTransferLineCreateDto` | Missing form | 1/4 | POST /api/inventory/transfer-lines (Create) |
| `InventoryTransferLineUpdateDto` | Missing form | 1/3 | PUT /api/inventory/transfer-lines/{id:long} (Update) |
| `InventoryTransferUpdateDto` | Missing form | 1/5 | PUT /api/inventory/transfers/{id:long} (Update) |

## HR

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `DepartmentCreateDto` | Partially implemented | 3/3 | POST /api/hr/departments (Create) |
| `DepartmentUpdateDto` | Missing form | 0/0 | PUT /api/hr/departments/{id:long} (Update) |
| `DesignationCreateDto` | Partially implemented | 3/3 | POST /api/hr/designations (Create) |
| `DesignationUpdateDto` | Missing form | 0/0 | PUT /api/hr/designations/{id:long} (Update) |
| `SubDepartmentCreateDto` | Partially implemented | 4/4 | POST /api/hr/subdepartments (Create) |
| `SubDepartmentUpdateDto` | Partially implemented | 3/3 | PUT /api/hr/subdepartments/{id:long} (Update) |
| `AttendanceDeviceCreateDto` | Partially implemented | 4/7 | POST /api/hr/expansion/attendance-devices (CreateAttendanceDevice) |
| `AttendanceDevicePunchCreateDto` | Missing form | 1/6 | POST /api/hr/expansion/attendance-punches (IngestAttendancePunch) |
| `AttendanceDeviceUpdateDto` | Partially implemented | 4/6 | PUT /api/hr/expansion/attendance-devices/{id:long} (UpdateAttendanceDevice) |
| `AttendanceLogCreateDto` | Partially implemented | 10/10 | POST /api/hr/attendance-logs (Create) |
| `AttendanceLogUpdateDto` | Partially implemented | 10/10 | PUT /api/hr/attendance-logs/{id:long} (Update) |
| `CredentialCreateDto` | Partially implemented | 9/9 | POST /api/hr/credentials (Create) |
| `CredentialExpiryAlertRunDto` | Missing form | 0/2 | POST /api/hr/expansion/credential-expiry-alerts/run (RunCredentialExpiryAlerts) |
| `CredentialUpdateDto` | Partially implemented | 9/9 | PUT /api/hr/credentials/{id:long} (Update) |
| `DisciplinaryIncidentCreateDto` | Partially implemented | 7/7 | POST /api/hr/disciplinary-incidents (Create) |
| `DisciplinaryIncidentUpdateDto` | Partially implemented | 7/7 | PUT /api/hr/disciplinary-incidents/{id:long} (Update) |
| `DutyRosterCreateDto` | Partially implemented | 5/5 | POST /api/hr/duty-rosters (Create) |
| `DutyRosterUpdateDto` | Partially implemented | 5/5 | PUT /api/hr/duty-rosters/{id:long} (Update) |
| `EmployeeHrProfileDto` | Implemented | 7/8 | PUT /api/hr/employees/{userProfileId:long}/profile (UpsertProfile) |
| `EmploymentLifecycleEventApproveDto` | Partially implemented | 2/3 | POST /api/hr/expansion/lifecycle-events/{id:long}/approve (ApproveLifecycleEvent) |
| `EmploymentLifecycleEventCreateDto` | Partially implemented | 3/9 | POST /api/hr/expansion/lifecycle-events (CreateLifecycleEvent) |
| `EmploymentProfileTagCreateDto` | Partially implemented | 4/4 | POST /api/hr/employment-profile-tags (Create) |
| `EmploymentProfileTagUpdateDto` | Partially implemented | 4/4 | PUT /api/hr/employment-profile-tags/{id:long} (Update) |
| `LeaveBalanceCreateDto` | Partially implemented | 6/6 | POST /api/hr/leave-balances (Create) |
| `LeaveBalanceUpdateDto` | Partially implemented | 6/6 | PUT /api/hr/leave-balances/{id:long} (Update) |
| `LeaveRequestCreateDto` | Partially implemented | 9/9 | POST /api/hr/leave-requests (Create) |
| `LeaveRequestUpdateDto` | Partially implemented | 9/9 | PUT /api/hr/leave-requests/{id:long} (Update) |
| `LeaveTypeCreateDto` | Partially implemented | 6/6 | POST /api/hr/leave-types (Create) |
| `LeaveTypeUpdateDto` | Partially implemented | 6/6 | PUT /api/hr/leave-types/{id:long} (Update) |
| `OnboardingChecklistItemCreateDto` | Partially implemented | 6/6 | POST /api/hr/onboarding-checklist-items (Create) |
| `OnboardingChecklistItemUpdateDto` | Partially implemented | 6/6 | PUT /api/hr/onboarding-checklist-items/{id:long} (Update) |
| `PayrollCreateDto` | Partially implemented | 7/7 | POST /api/hr/payrolls (Create) |
| `PayrollPostingBatchCreateDto` | Missing form | 0/2 | POST /api/hr/expansion/payroll-posting-batches (CreatePayrollPostingBatch) |
| `PayrollPostingBatchPostDto` | Missing form | 0/1 | POST /api/hr/expansion/payroll-posting-batches/{id:long}/mark-posted (MarkPayrollPostingBatchPosted) |
| `PayrollUpdateDto` | Partially implemented | 7/7 | PUT /api/hr/payrolls/{id:long} (Update) |
| `PerformanceAppraisalCreateDto` | Partially implemented | 7/7 | POST /api/hr/performance-appraisals (Create) |
| `PerformanceAppraisalUpdateDto` | Partially implemented | 7/7 | PUT /api/hr/performance-appraisals/{id:long} (Update) |
| `PerformanceGoalCreateDto` | Partially implemented | 3/7 | POST /api/hr/expansion/performance-goals (CreatePerformanceGoal) |
| `PerformanceGoalUpdateDto` | Partially implemented | 3/4 | PUT /api/hr/expansion/performance-goals/{id:long} (UpdatePerformanceGoal) |
| `PermissionCreateDto` | Partially implemented | 5/5 | POST /api/hr/permissions (Create) |
| `PermissionUpdateDto` | Partially implemented | 5/5 | PUT /api/hr/permissions/{id:long} (Update) |
| `RosterCoverageRunDto` | Partially implemented | 2/3 | POST /api/hr/expansion/roster-coverage/run (RunRosterCoverage) |
| `ShiftCreateDto` | Partially implemented | 7/7 | POST /api/hr/shifts (Create) |
| `ShiftUpdateDto` | Partially implemented | 7/7 | PUT /api/hr/shifts/{id:long} (Update) |
| `StaffScheduleRequirementCreateDto` | Partially implemented | 3/8 | POST /api/hr/expansion/schedule-requirements (CreateScheduleRequirement) |
| `StaffScheduleRequirementUpdateDto` | Partially implemented | 3/8 | PUT /api/hr/expansion/schedule-requirements/{id:long} (UpdateScheduleRequirement) |
| `TrainingEnrollmentCreateDto` | Partially implemented | 9/9 | POST /api/hr/training-enrollments (Create) |
| `TrainingEnrollmentUpdateDto` | Partially implemented | 9/9 | PUT /api/hr/training-enrollments/{id:long} (Update) |

## OT/ICU/Operations

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AnesthesiaEventCreateDto` | Partially implemented | 2/7 | POST /api/operations/anesthesia-events (Create) |
| `AnesthesiaEventUpdateDto` | Partially implemented | 2/6 | PUT /api/operations/anesthesia-events/{id:long} (Update) |
| `AnesthesiaRecordCreateDto` | Missing form | 1/8 | POST /api/operations/anesthesia-records (Create) |
| `AnesthesiaRecordUpdateDto` | Missing form | 1/7 | PUT /api/operations/anesthesia-records/{id:long} (Update) |
| `IcuBedCreateDto` | Partially implemented | 2/6 | POST /api/operations/icu-beds (Create) |
| `IcuBedUpdateDto` | Missing form | 1/5 | PUT /api/operations/icu-beds/{id:long} (Update) |
| `IcuFlowSheetCreateDto` | Partially implemented | 2/7 | POST /api/operations/icu-flow-sheets (Create) |
| `IcuFlowSheetEntryCreateDto` | Partially implemented | 2/12 | POST /api/operations/icu-flow-sheet-entries (Create) |
| `IcuFlowSheetEntryUpdateDto` | Partially implemented | 2/11 | PUT /api/operations/icu-flow-sheet-entries/{id:long} (Update) |
| `IcuFlowSheetUpdateDto` | Missing form | 1/5 | PUT /api/operations/icu-flow-sheets/{id:long} (Update) |
| `OperatingRoomCreateDto` | Partially implemented | 4/5 | POST /api/operations/operating-rooms (Create) |
| `OperatingRoomUpdateDto` | Partially implemented | 3/4 | PUT /api/operations/operating-rooms/{id:long} (Update) |
| `OtScheduleCreateDto` | Partially implemented | 3/12 | POST /api/operations/ot-schedules (Create) |
| `OtScheduleUpdateDto` | Partially implemented | 2/10 | PUT /api/operations/ot-schedules/{id:long} (Update) |
| `PreOpChecklistCreateDto` | Partially implemented | 2/9 | POST /api/operations/pre-op-checklists (Create) |
| `PreOpChecklistItemCreateDto` | Partially implemented | 3/6 | POST /api/operations/pre-op-checklist-items (Create) |
| `PreOpChecklistItemUpdateDto` | Partially implemented | 3/5 | PUT /api/operations/pre-op-checklist-items/{id:long} (Update) |
| `PreOpChecklistUpdateDto` | Partially implemented | 2/8 | PUT /api/operations/pre-op-checklists/{id:long} (Update) |
| `ProcedureCatalogItemCreateDto` | Partially implemented | 3/7 | POST /api/operations/procedure-catalog (Create) |
| `ProcedureCatalogItemUpdateDto` | Partially implemented | 2/6 | PUT /api/operations/procedure-catalog/{id:long} (Update) |
| `ProcedureConsumableCreateDto` | Partially implemented | 3/7 | POST /api/operations/procedure-consumables (Create) |
| `ProcedureConsumableUpdateDto` | Partially implemented | 3/6 | PUT /api/operations/procedure-consumables/{id:long} (Update) |
| `ProcedureNoteCreateDto` | Missing form | 1/9 | POST /api/operations/procedure-notes (Create) |
| `ProcedureNoteUpdateDto` | Missing form | 1/8 | PUT /api/operations/procedure-notes/{id:long} (Update) |

## Quality/Compliance

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AuditChecklistCreateDto` | Partially implemented | 4/5 | POST /api/quality/audit-checklists (Create) |
| `AuditChecklistItemCreateDto` | Missing form | 1/4 | POST /api/quality/audit-checklist-items (Create) |
| `AuditChecklistItemUpdateDto` | Missing form | 1/3 | PUT /api/quality/audit-checklist-items/{id:long} (Update) |
| `AuditChecklistUpdateDto` | Partially implemented | 4/4 | PUT /api/quality/audit-checklists/{id:long} (Update) |
| `AuditFindingCreateDto` | Partially implemented | 2/8 | POST /api/quality/audit-findings (Create) |
| `AuditFindingUpdateDto` | Partially implemented | 2/7 | PUT /api/quality/audit-findings/{id:long} (Update) |
| `ComplianceTaskCreateDto` | Missing form | 1/7 | POST /api/quality/compliance-tasks (Create) |
| `ComplianceTaskUpdateDto` | Missing form | 1/6 | PUT /api/quality/compliance-tasks/{id:long} (Update) |
| `CorrectiveActionCreateDto` | Missing form | 1/8 | POST /api/quality/corrective-actions (Create) |
| `CorrectiveActionUpdateDto` | Missing form | 1/8 | PUT /api/quality/corrective-actions/{id:long} (Update) |
| `IncidentActionCreateDto` | Partially implemented | 3/7 | POST /api/quality/incident-actions (Create) |
| `IncidentActionUpdateDto` | Partially implemented | 3/6 | PUT /api/quality/incident-actions/{id:long} (Update) |
| `IncidentReportCreateDto` | Partially implemented | 8/12 | POST /api/quality/incidents (Create) |
| `IncidentReportUpdateDto` | Partially implemented | 8/11 | PUT /api/quality/incidents/{id:long} (Update) |
| `InfectionControlCaseCreateDto` | Partially implemented | 2/9 | POST /api/quality/infection-control-cases (Create) |
| `InfectionControlCaseUpdateDto` | Missing form | 1/7 | PUT /api/quality/infection-control-cases/{id:long} (Update) |
| `MortalityReviewCreateDto` | Partially implemented | 2/9 | POST /api/quality/mortality-reviews (Create) |
| `MortalityReviewUpdateDto` | Missing form | 1/7 | PUT /api/quality/mortality-reviews/{id:long} (Update) |
| `RiskRegisterEntryCreateDto` | Partially implemented | 2/9 | POST /api/quality/risk-register (Create) |
| `RiskRegisterEntryUpdateDto` | Partially implemented | 2/8 | PUT /api/quality/risk-register/{id:long} (Update) |

## Analytics

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AnalyticsMetricSnapshotCreateDto` | Partially implemented | 2/9 | POST /api/analytics/metric-snapshots (Create) |
| `AnalyticsMetricSnapshotUpdateDto` | Partially implemented | 2/8 | PUT /api/analytics/metric-snapshots/{id:long} (Update) |
| `AnalyticsAlertRuleCreateDto` | Partially implemented | 2/7 | POST /api/analytics/alert-rules (Create) |
| `AnalyticsAlertRuleUpdateDto` | Partially implemented | 2/6 | PUT /api/analytics/alert-rules/{id:long} (Update) |
| `AnalyticsDashboardCreateDto` | Partially implemented | 2/7 | POST /api/analytics/dashboards (Create) |
| `AnalyticsDashboardUpdateDto` | Partially implemented | 2/6 | PUT /api/analytics/dashboards/{id:long} (Update) |
| `AnalyticsDashboardWidgetCreateDto` | Partially implemented | 2/9 | POST /api/analytics/dashboard-widgets (Create) |
| `AnalyticsDashboardWidgetUpdateDto` | Partially implemented | 2/7 | PUT /api/analytics/dashboard-widgets/{id:long} (Update) |
| `AnalyticsExportJobCreateDto` | Partially implemented | 2/9 | POST /api/analytics/export-jobs (Create) |
| `AnalyticsExportJobUpdateDto` | Partially implemented | 2/8 | PUT /api/analytics/export-jobs/{id:long} (Update) |
| `AnalyticsMetricDefinitionCreateDto` | Partially implemented | 5/12 | POST /api/analytics/metric-definitions (Create) |
| `AnalyticsMetricDefinitionUpdateDto` | Partially implemented | 5/11 | PUT /api/analytics/metric-definitions/{id:long} (Update) |
| `AnalyticsReportDefinitionCreateDto` | Partially implemented | 2/7 | POST /api/analytics/report-definitions (Create) |
| `AnalyticsReportDefinitionUpdateDto` | Partially implemented | 2/6 | PUT /api/analytics/report-definitions/{id:long} (Update) |
| `AnalyticsReportRunCreateDto` | Missing form | 1/8 | POST /api/analytics/report-runs (Create) |
| `AnalyticsReportRunUpdateDto` | Missing form | 1/7 | PUT /api/analytics/report-runs/{id:long} (Update) |
| `AnalyticsScheduledReportCreateDto` | Partially implemented | 3/8 | POST /api/analytics/scheduled-reports (Create) |
| `AnalyticsScheduledReportUpdateDto` | Partially implemented | 3/6 | PUT /api/analytics/scheduled-reports/{id:long} (Update) |
| `AnalyticsWarehouseDatasetCreateDto` | Partially implemented | 2/7 | POST /api/analytics/warehouse-datasets (Create) |
| `AnalyticsWarehouseDatasetUpdateDto` | Partially implemented | 2/6 | PUT /api/analytics/warehouse-datasets/{id:long} (Update) |
| `AnalyticsWarehouseRefreshCreateDto` | Partially implemented | 2/6 | POST /api/analytics/warehouse-refreshes (Create) |
| `AnalyticsWarehouseRefreshUpdateDto` | Partially implemented | 2/5 | PUT /api/analytics/warehouse-refreshes/{id:long} (Update) |
| `CompleteAnalyticsExportJobRequestDto` | Missing form | 1/2 | POST /api/analytics/workflow/export-jobs/{exportJobId:long}/complete (CompleteExportJob) |
| `CompleteAnalyticsReportRunRequestDto` | Partially implemented | 2/3 | POST /api/analytics/workflow/report-runs/{reportRunId:long}/complete (CompleteReportRun) |
| `QueueAnalyticsExportJobRequestDto` | Missing form | 1/5 | POST /api/analytics/workflow/export-jobs (QueueExportJob) |
| `QueueAnalyticsReportRunRequestDto` | Missing form | 0/4 | POST /api/analytics/workflow/report-runs (QueueReportRun) |
| `RunWarehouseRefreshRequestDto` | Partially implemented | 2/4 | POST /api/analytics/workflow/warehouse-refreshes/run (RunWarehouseRefresh) |

## Patient Engagement

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `PatientAppointmentRequestCreateDto` | Partially implemented | 7/9 | POST /api/patient-engagement/appointment-requests (Create) |
| `PatientAppointmentRequestUpdateDto` | Partially implemented | 6/8 | PUT /api/patient-engagement/appointment-requests/{id:long} (Update) |
| `PatientPrescriptionAccessCreateDto` | Partially implemented | 2/7 | POST /api/patient-engagement/prescription-access (Create) |
| `PatientPrescriptionAccessUpdateDto` | Missing form | 1/5 | PUT /api/patient-engagement/prescription-access/{id:long} (Update) |
| `TelemedicineMessageCreateDto` | Partially implemented | 2/8 | POST /api/patient-engagement/telemedicine-messages (Create) |
| `TelemedicineMessageUpdateDto` | Missing form | 1/6 | PUT /api/patient-engagement/telemedicine-messages/{id:long} (Update) |
| `TelemedicineSessionCreateDto` | Partially implemented | 4/10 | POST /api/patient-engagement/telemedicine-sessions (Create) |
| `TelemedicineSessionUpdateDto` | Partially implemented | 3/9 | PUT /api/patient-engagement/telemedicine-sessions/{id:long} (Update) |
| `PatientPaymentLinkCreateDto` | Partially implemented | 6/10 | POST /api/patient-engagement/payment-links (Create) |
| `PatientPaymentLinkUpdateDto` | Partially implemented | 5/8 | PUT /api/patient-engagement/payment-links/{id:long} (Update) |
| `PatientNotificationCreateDto` | Partially implemented | 4/8 | POST /api/patient-engagement/notifications (Create) |
| `PatientNotificationUpdateDto` | Partially implemented | 3/7 | PUT /api/patient-engagement/notifications/{id:long} (Update) |
| `PatientBillAccessCreateDto` | Partially implemented | 6/9 | POST /api/patient-engagement/bill-access (Create) |
| `PatientBillAccessUpdateDto` | Partially implemented | 4/7 | PUT /api/patient-engagement/bill-access/{id:long} (Update) |
| `PatientDeviceRegistrationCreateDto` | Partially implemented | 3/7 | POST /api/patient-engagement/device-registrations (Create) |
| `PatientDeviceRegistrationUpdateDto` | Partially implemented | 2/6 | PUT /api/patient-engagement/device-registrations/{id:long} (Update) |
| `PatientPortalProfileCreateDto` | Missing form | 1/7 | POST /api/patient-engagement/portal-profiles (Create) |
| `PatientPortalProfileUpdateDto` | Missing form | 0/6 | PUT /api/patient-engagement/portal-profiles/{id:long} (Update) |
| `PatientReminderCreateDto` | Partially implemented | 4/8 | POST /api/patient-engagement/reminders (Create) |
| `PatientReminderUpdateDto` | Partially implemented | 3/7 | PUT /api/patient-engagement/reminders/{id:long} (Update) |
| `PatientResultAccessCreateDto` | Partially implemented | 3/10 | POST /api/patient-engagement/result-access (Create) |
| `PatientResultAccessUpdateDto` | Missing form | 1/7 | PUT /api/patient-engagement/result-access/{id:long} (Update) |

## Interoperability

| DTO | Status | Field hits | Endpoint |
|---|---|---:|---|
| `AssignHumanReviewCaseRequestDto` | Missing form | 1/1 | POST /api/interoperability/workflow/human-review-cases/{id:long}/assign (AssignHumanReviewCase) |
| `CompleteFhirSyncRequestDto` | Partially implemented | 2/3 | POST /api/interoperability/exchange/fhir-sync-jobs/{fhirSyncJobId:long}/complete (CompleteFhirSync) |
| `DicomStudyLinkCreateDto` | Partially implemented | 2/8 | POST /api/interoperability/dicom-study-links (Create) |
| `DicomStudyLinkUpdateDto` | Partially implemented | 2/6 | PUT /api/interoperability/dicom-study-links/{id:long} (Update) |
| `FhirEndpointCreateDto` | Missing form | 1/6 | POST /api/interoperability/fhir-endpoints (Create) |
| `FhirEndpointUpdateDto` | Missing form | 1/4 | PUT /api/interoperability/fhir-endpoints/{id:long} (Update) |
| `FhirResourceMappingCreateDto` | Partially implemented | 2/5 | POST /api/interoperability/fhir-resource-mappings (Create) |
| `FhirResourceMappingUpdateDto` | Partially implemented | 2/3 | PUT /api/interoperability/fhir-resource-mappings/{id:long} (Update) |
| `FhirSyncJobCreateDto` | Partially implemented | 3/8 | POST /api/interoperability/fhir-sync-jobs (Create) |
| `FhirSyncJobUpdateDto` | Partially implemented | 3/7 | PUT /api/interoperability/fhir-sync-jobs/{id:long} (Update) |
| `Hl7InterfaceCreateDto` | Partially implemented | 3/7 | POST /api/interoperability/hl7-interfaces (Create) |
| `Hl7InterfaceUpdateDto` | Partially implemented | 3/5 | PUT /api/interoperability/hl7-interfaces/{id:long} (Update) |
| `Hl7MessageLogCreateDto` | Partially implemented | 3/8 | POST /api/interoperability/hl7-message-logs (Create) |
| `Hl7MessageLogUpdateDto` | Partially implemented | 3/6 | PUT /api/interoperability/hl7-message-logs/{id:long} (Update) |
| `IntegrationEventLogCreateDto` | Partially implemented | 3/8 | POST /api/interoperability/event-logs (Create) |
| `IntegrationEventLogUpdateDto` | Partially implemented | 3/7 | PUT /api/interoperability/event-logs/{id:long} (Update) |
| `IntegrationPartnerCreateDto` | Partially implemented | 2/7 | POST /api/interoperability/partners (Create) |
| `IntegrationPartnerUpdateDto` | Partially implemented | 2/6 | PUT /api/interoperability/partners/{id:long} (Update) |
| `LinkDicomStudyRequestDto` | Partially implemented | 2/8 | POST /api/interoperability/exchange/dicom-study-links (LinkDicomStudy) |
| `MarkOutboxDispatchedRequestDto` | Missing form | 0/1 | POST /api/interoperability/workflow/outbox/{id:long}/dispatched (MarkDispatched) |
| `MarkOutboxFailedRequestDto` | Missing form | 1/3 | POST /api/interoperability/workflow/outbox/{id:long}/failed (MarkFailed) |
| `MarkWebhookDeliveryResultRequestDto` | Missing form | 1/4 | POST /api/interoperability/exchange/webhook-deliveries/{webhookDeliveryLogId:long}/result (MarkWebhookDeliveryResult) |
| `OpenHumanReviewCaseRequestDto` | Partially implemented | 4/8 | POST /api/interoperability/workflow/human-review-cases (OpenHumanReviewCase) |
| `PacsEndpointCreateDto` | Partially implemented | 3/7 | POST /api/interoperability/pacs-endpoints (Create) |
| `PacsEndpointUpdateDto` | Partially implemented | 3/5 | PUT /api/interoperability/pacs-endpoints/{id:long} (Update) |
| `QueueOutboxMessageRequestDto` | Partially implemented | 3/8 | POST /api/interoperability/workflow/outbox (QueueOutbox) |
| `QueueWebhookDeliveryRequestDto` | Missing form | 0/2 | POST /api/interoperability/exchange/webhook-deliveries (QueueWebhookDelivery) |
| `RecordHl7MessageRequestDto` | Partially implemented | 3/7 | POST /api/interoperability/exchange/hl7-messages (RecordHl7Message) |
| `ResolveHumanReviewCaseRequestDto` | Missing form | 0/2 | POST /api/interoperability/workflow/human-review-cases/{id:long}/resolve (ResolveHumanReviewCase) |
| `StartFhirSyncRequestDto` | Missing form | 1/3 | POST /api/interoperability/exchange/fhir-sync-jobs (StartFhirSync) |
| `TerminologyConceptCreateDto` | Partially implemented | 3/5 | POST /api/interoperability/terminology-concepts (Create) |
| `TerminologyConceptUpdateDto` | Partially implemented | 2/3 | PUT /api/interoperability/terminology-concepts/{id:long} (Update) |
| `TerminologyMappingCreateDto` | Missing form | 1/6 | POST /api/interoperability/terminology-mappings (Create) |
| `TerminologyMappingUpdateDto` | Missing form | 1/4 | PUT /api/interoperability/terminology-mappings/{id:long} (Update) |
| `TerminologySystemCreateDto` | Partially implemented | 3/6 | POST /api/interoperability/terminology-systems (Create) |
| `TerminologySystemUpdateDto` | Partially implemented | 3/5 | PUT /api/interoperability/terminology-systems/{id:long} (Update) |
| `WebhookDeliveryLogCreateDto` | Missing form | 1/8 | POST /api/interoperability/webhook-deliveries (Create) |
| `WebhookDeliveryLogUpdateDto` | Missing form | 1/6 | PUT /api/interoperability/webhook-deliveries/{id:long} (Update) |
| `WebhookSubscriptionCreateDto` | Missing form | 1/6 | POST /api/interoperability/webhook-subscriptions (Create) |
| `WebhookSubscriptionUpdateDto` | Unclear / needs backend confirmation | 1/4 | PUT /api/interoperability/webhook-subscriptions/{id:long} (Update) |

## Implementation Pass: Inventory / Procurement, Pharmacy, Lab / Radiology

### Inventory / Procurement checklist

- [x] Identified inventory/procurement DTO families from `New Text Document.txt`: `InventoryProcurementRiskDto`, `InventoryRiskItemDto`, `InventoryExpiryRiskDto`, pharmacy/inventory stock lot, purchase order, purchase order line, stock adjustment, stock ledger, expiry action, and supplier-linked receiving DTOs.
- [x] Confirmed existing UI was generic enterprise coverage only: `/inventory/procurement`, `/inventory/stock-movements`, and `/inventory/reports`.
- [x] Added dedicated enterprise screens/forms for suppliers, requisitions, purchase orders, receiving, stock lots, expiry management, and adjustments.
- [x] Added supplier lookup support through `LookupKind = supplier`.
- [x] Added batch/expiry/stock validation in `EnterpriseModulePage`: required fields, positive quantities, non-negative amounts, and no past expiry date.
- [ ] Backend confirmation needed: exact API payload casing and whether purchase-order line arrays must be submitted as nested detail collections instead of one line per generic form command.

### Pharmacy checklist

- [x] Identified pharmacy DTO families from `New Text Document.txt`: `MedicationOrderCreateDto`, `MedicationOrderUpdateDto`, `PrescriptionCreateDto`, `PrescriptionUpdateDto`, `PrescriptionWorkflowInputDto`, `MedicationWorkflowInputDto`, `PharmacyUnitConversionRequestDto`, `PharmacyExpiryActionCreateDto`, `PharmacyPurchaseOrderCreateDto`, `PharmacyPurchaseOrderLineCreateDto`, `PharmacyStockAdjustmentCreateDto`, and stock ledger/expiry report DTOs.
- [x] Verified existing pharmacy UI was generic enterprise coverage: dispensing, batches, unit/box sales, free medicine, payment modes, and reports.
- [x] Expanded pharmacy forms with prescription linkage, encounter, store, medicine, batch number, expiry date, quantity, sale unit, unit price, total amount, payment mode, payment account, status, workflow type, and reason.
- [x] Added workflow actions for verification and dispensing on pharmacy rows.
- [x] Idempotency is covered by the shared enterprise mutation path for create/update/workflow actions.
- [ ] Backend confirmation needed: whether medication/prescription clinical DTOs should remain in OPD/checkup workflow only or get a separate prescription-management page.

### Lab / Radiology checklist

- [x] Identified lab/radiology DTO families from `New Text Document.txt`: `ClinicalOrderCreateDto`, `ClinicalOrderUpdateDto`, `ClinicalOrderWorkflowInputDto`, `ChangeClinicalOrderStatusRequestDto`, `ReleaseClinicalOrderResultRequestDto`, laboratory result amendment/verification DTOs, radiology worklist/report/approval DTOs, and patient visible diagnostic result/report DTOs.
- [x] Verified existing UI was generic enterprise coverage: diagnostic orders, sample collection, result entry, reports, approvals, radiology worklist, and radiology reporting.
- [x] Expanded lab/radiology forms with encounter, order ID, accession number, order type, lab test, radiology study, priority, status, sample/barcode number, result value, result unit, reference range, critical flag, quality-control status, report text, findings, impression, report file/upload URI, and notes.
- [x] Added status workflow buttons for ordered, in progress, verified, approved, and released flows across diagnostics/radiology queues.
- [x] Idempotency is covered by the shared enterprise mutation path for orders, result release, verification, and approval actions.
- [ ] Backend confirmation needed: whether report upload expects a real multipart file field, a document-storage URI, or a generated `ReportPath` string.

## Implementation Pass: IPD / Emergency / OT / ICU, Analytics / Observability, Patient Engagement / Interoperability, API Hardening

### IPD / Emergency / OT / ICU checklist

- [x] Confirmed IPD had enterprise screens only: admissions, bed board, nursing, MAR, and discharge.
- [x] Confirmed Emergency, OT, and ICU did not have real dedicated UI pages before this pass.
- [x] Expanded IPD form coverage with encounter/admission numbers, encounter type, admission date, ward, bed, bed code, status, disposition, effective date, workflow type, and notes.
- [x] Added enterprise screens/forms for emergency triage, emergency encounters, observation beds, OT procedures, and ICU workflows.
- [x] Added status/disposition workflow actions: admit, transfer, discharge, cancel, in progress, disposition, schedule, start, complete, verify.
- [ ] Backend confirmation needed: exact active DTO ownership between platform `WardCreateDto`, inpatient admission DTOs, emergency observation-bed DTOs, and any OT/ICU module-specific procedure DTOs.

### Analytics / Observability checklist

- [x] Confirmed analytics is mostly dashboard/read-only coverage in the UI, while observability already has a real admin page.
- [x] Added analytics export/job screen for report/export workflow DTOs.
- [x] Added analytics query/export fields: from, to, facility, department, tenant ID, property ID, report type, export format, export limit, and notes.
- [x] Added analytics filters for status, facility, department, report type, export format, and date range.
- [ ] Backend confirmation needed: whether analytics export endpoints require queued report-run DTOs, export-job DTOs, or both for the final marketing demo workflow.

### Patient Engagement / Interoperability checklist

- [x] Added patient engagement screens/forms for portal accounts, prescription access, notifications, consents, and messages.
- [x] Added fields for patient, prescription ID, access code, portal visibility, expiry, status, consent type/text/signature, notification type/channel/body, scheduled date, telemedicine message/session data, and delivery status.
- [x] Added interoperability screens/forms for outbox, HL7/FHIR, partners, external exchange, webhooks, and PACS/DICOM links.
- [x] Added interoperability fields for partner, endpoint, message type, resource type, external reference, payload reference/URI, status, retry count, workflow type, and notes.
- [x] Added workflow actions for send, retry, resolve, verify, sign, and cancel where appropriate.
- [x] Audit trail/status views are represented through `/admin/audit`, `/admin/observability`, status filters, and queue row statuses.
- [ ] Backend confirmation needed: exact exchange payload shape for FHIR bundles, HL7 messages, webhook deliveries, PACS/DICOM links, and patient-engagement consent signing.

### API contract hardening checklist

- [x] Shared enterprise mutations already apply idempotency keys to create/update/workflow actions.
- [x] Sensitive enterprise forms and workflow actions now require audit reason where the screen is patient, finance, clinical, IPD, emergency, OT/ICU, inventory, pharmacy, interoperability, or consent/prescription-access related.
- [x] API context headers now send both canonical tenant/property headers and existing facility aliases: `X-Tenant-Id`, `X-Tenant-ID`, `X-Property-Id`, `X-Property-ID`, `X-Facility-Id`, and `X-Facility-ID`.
- [x] Enterprise API mutations normalize camelCase form state to PascalCase DTO payload keys before POST/PUT.
- [x] Response unwrapping continues through shared `unwrapApiData` and enterprise workspace normalization for list/table/dashboard payloads.
- [ ] Remaining hardening task: audit all non-enterprise legacy services for any sensitive POST/PUT/PATCH calls missing `meta.idempotencyKey`, because this pass hardened the shared enterprise service and previously touched payment/checkup/finance/HR services but not every old MVC service.
