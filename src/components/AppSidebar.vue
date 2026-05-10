<template>
  <aside class="sidebar" :class="{ open: open }">
    <div class="brand-row">
      <div class="brand">HMIS</div>

      <button class="close" type="button" @click="emit('close')" aria-label="Close menu">
        ×
      </button>
    </div>

    <nav>
      <!-- DASHBOARD -->
      <div class="menu-group" v-if="canSee('dashboard')">
        <RouterLink to="/dashboard" class="menu-title single-link" @click="onNavigate">
          Dashboard
        </RouterLink>
      </div>

      <!-- PATIENT MANAGEMENT -->
      <div class="menu-group" v-if="canSee('patients')">
        <div class="menu-title" @click="toggle('patients')">
          Patient Management
          <span>{{ menuOpen.patients ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.patients" class="submenu">
          <RouterLink v-if="canSee('patients.list')" to="/patients" @click="onNavigate">
            Patient List
          </RouterLink>
          <RouterLink v-if="canSee('patients.queue')" to="/patients/queue" @click="onNavigate">
            Registration Queue
          </RouterLink>
          <RouterLink v-if="canSee('patients.checkups')" to="/checkups" @click="onNavigate">
            Checkups / Visits
          </RouterLink>
          <RouterLink v-if="canSee('patients.appointments')" to="/appointments" @click="onNavigate">
            Appointments
          </RouterLink>

          <RouterLink v-if="canSee('patients.payments')" to="/payments" @click="onNavigate">
            Payment
          </RouterLink>

          <RouterLink v-if="canSee('patients.counterClosing')" to="/finance/counter-closing" @click="onNavigate">
            Counter Closing
          </RouterLink>

          <div class="submenu-divider" v-if="canSee('opd')">Visits / OPD</div>

          <RouterLink v-if="canSee('opd.workflow')" to="/opd/workflow" @click="onNavigate">
            OPD Workflow
          </RouterLink>

          <RouterLink v-if="canSee('opd.prescriptions')" to="/opd/prescriptions" @click="onNavigate">
            Prescriptions
          </RouterLink>
          <RouterLink v-if="canSee('opd.diagnosis')" to="/opd/diagnosis" @click="onNavigate">
            Diagnosis
          </RouterLink>
          <RouterLink v-if="canSee('opd.vitals')" to="/opd/vital-signs" @click="onNavigate">
            Vital Signs
          </RouterLink>
          <RouterLink v-if="canSee('opd.procedures')" to="/opd/procedures" @click="onNavigate">
            Procedures
          </RouterLink>
          <RouterLink v-if="canSee('opd.followups')" to="/opd/follow-ups" @click="onNavigate">
            Follow-ups
          </RouterLink>
        </div>
      </div>

      <!-- HUMAN RESOURCE -->
      <!-- HUMAN RESOURCE -->
      <div class="menu-group" v-if="canSee('hr')">
        <div class="menu-title" @click="toggle('hr')">
          Human Resource
          <span>{{ menuOpen.hr ? '▾' : '▸' }}</span>
        </div>

        <div v-if="menuOpen.hr" class="submenu">
          <div class="submenu-divider">Masters</div>

          <RouterLink v-if="canSee('hr.departments')" to="/hr/departments" @click="onNavigate">
            Departments
          </RouterLink>

          <RouterLink v-if="canSee('hr.designations')" to="/hr/designations" @click="onNavigate">
            Designations
          </RouterLink>

          <RouterLink v-if="canSee('hr.shifts')" to="/hr/shifts" @click="onNavigate">
            Shifts
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveTypes')" to="/hr/leave-types" @click="onNavigate">
            Leave Types
          </RouterLink>

          <RouterLink v-if="canSee('hr.permissions')" to="/hr/permissions" @click="onNavigate">
            Permissions
          </RouterLink>

          <RouterLink v-if="canSee('hr.onboardingChecklistItems')" to="/hr/onboarding-checklist-items"
            @click="onNavigate">
            Onboarding Checklist
          </RouterLink>

          <div class="submenu-divider">Operations</div>

          <RouterLink v-if="canSee('hr.workforce')" to="/employees" @click="onNavigate">
            Workforce
          </RouterLink>

          <RouterLink v-if="canSee('hr.attendanceLogs')" to="/hr/attendance-logs" @click="onNavigate">
            Attendance Logs
          </RouterLink>

          <RouterLink v-if="canSee('hr.dutyRosters')" to="/hr/duty-rosters" @click="onNavigate">
            Duty Rosters
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveBalances')" to="/hr/leave-balances" @click="onNavigate">
            Leave Balances
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveRequests')" to="/hr/leave-requests" @click="onNavigate">
            Leave Requests
          </RouterLink>

          <RouterLink v-if="canSee('hr.payrolls')" to="/hr/payrolls" @click="onNavigate">
            Payrolls
          </RouterLink>

          <div class="submenu-divider">Compliance</div>

          <RouterLink v-if="canSee('hr.credentials')" to="/hr/credentials" @click="onNavigate">
            Credentials
          </RouterLink>

          <RouterLink v-if="canSee('hr.trainingEnrollments')" to="/hr/training-enrollments" @click="onNavigate">
            Training Enrollments
          </RouterLink>

          <RouterLink v-if="canSee('hr.performanceAppraisals')" to="/hr/performance-appraisals" @click="onNavigate">
            Performance Appraisals
          </RouterLink>

          <RouterLink v-if="canSee('hr.disciplinaryIncidents')" to="/hr/disciplinary-incidents" @click="onNavigate">
            Disciplinary Incidents
          </RouterLink>

          <RouterLink v-if="canSee('hr.employmentProfileTags')" to="/hr/employment-profile-tags" @click="onNavigate">
            Employment Profile Tags
          </RouterLink>
        </div>
      </div>

      <!-- BILLING & FINANCE -->
      <div class="menu-group" v-if="canSee('finance')">
        <div class="menu-title" @click="toggle('billing')">
          Billing & Finance
          <span>{{ menuOpen.billing ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.billing" class="submenu">
          <RouterLink v-if="canSee('finance.receipts')" to="/payments" @click="onNavigate">
            Receipts
          </RouterLink>
          <RouterLink v-if="canSee('finance.refunds')" to="/finance/refunds" @click="onNavigate">
            Refunds
          </RouterLink>
          <RouterLink v-if="canSee('finance.claims')" to="/finance/claims" @click="onNavigate">
            Insurance Claims
          </RouterLink>
          <RouterLink v-if="canSee('finance.sehatCardClaims')" to="/finance/sehat-card-claims" @click="onNavigate">
            Sehat Card Claims
          </RouterLink>
          <RouterLink v-if="canSee('finance.panelBilling')" to="/finance/panel-billing" @click="onNavigate">
            Panel / TPA Billing
          </RouterLink>
          <RouterLink v-if="canSee('finance.posting')" to="/finance/posting-dashboard" @click="onNavigate">
            Posting Dashboard
          </RouterLink>
          <RouterLink v-if="canSee('finance.doctorShare')" to="/finance/doctor-share" @click="onNavigate">
            Doctor Share
          </RouterLink>
          <RouterLink v-if="canSee('finance.leakage')" to="/finance/leakage-dashboard" @click="onNavigate">
            Leakage Dashboard
          </RouterLink>
          <RouterLink v-if="canSee('finance.coa')" to="/finance/chartofaccounts" @click="onNavigate">
            Chart Of Account
          </RouterLink>
          <RouterLink v-if="canSee('finance.posting')" to="/finance/revenue-vouchers" @click="onNavigate">
            Revenue Vouchers
          </RouterLink>
          <RouterLink v-if="canSee('finance.expenseVouchers')" to="/finance/expense-vouchers" @click="onNavigate">
            Expense Voucher
          </RouterLink>
          <RouterLink v-if="canSee('finance.dailyClosing')" to="/finance/daily-closing" @click="onNavigate">
            Daily Closing
          </RouterLink>
        </div>
      </div>

      <!-- LAB -->
      <div class="menu-group" v-if="canSee('lab')">
        <div class="menu-title" @click="toggle('lab')">
          Laboratory
          <span>{{ menuOpen.lab ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.lab" class="submenu">
          <RouterLink v-if="canSee('lab.orders')" to="/diagnostics/orders" @click="onNavigate">
            Diagnostic Orders
          </RouterLink>
          <RouterLink v-if="canSee('lab.tests')" to="/diagnostics/lab-tests" @click="onNavigate">
            Lab Tests
          </RouterLink>
          <RouterLink v-if="canSee('lab.categories')" to="/diagnostics/categories" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('lab.sample')" to="/diagnostics/sample-collection" @click="onNavigate">
            Sample Collection
          </RouterLink>
          <RouterLink v-if="canSee('lab.results')" to="/diagnostics/results" @click="onNavigate">
            Result Entry
          </RouterLink>
          <RouterLink v-if="canSee('lab.reports')" to="/diagnostics/reports" @click="onNavigate">
            Reports
          </RouterLink>
          <RouterLink v-if="canSee('lab.approvals')" to="/diagnostics/approvals" @click="onNavigate">
            Approvals
          </RouterLink>
          <RouterLink v-if="canSee('radiology.worklist')" to="/radiology/worklist" @click="onNavigate">
            Radiology Worklist
          </RouterLink>
          <RouterLink v-if="canSee('radiology.reporting')" to="/radiology/reporting" @click="onNavigate">
            Radiology Reporting
          </RouterLink>
        </div>
      </div>

      <!-- PHARMACY -->
      <div class="menu-group" v-if="canSee('pharmacy')">
        <div class="menu-title" @click="toggle('pharmacy')">
          Pharmacy
          <span>{{ menuOpen.pharmacy ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.pharmacy" class="submenu">
          <RouterLink v-if="canSee('pharmacy.dispensing')" to="/pharmacy/dispensing" @click="onNavigate">
            Dispensing
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.batches')" to="/pharmacy/batches" @click="onNavigate">
            Batch & Expiry
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.sales')" to="/pharmacy/unit-box-sales" @click="onNavigate">
            Unit / Box Sales
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.freeMedicine')" to="/pharmacy/free-medicine" @click="onNavigate">
            Free Medicine
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.paymentModes')" to="/pharmacy/payment-modes" @click="onNavigate">
            Payment Modes
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.reports')" to="/pharmacy/reports" @click="onNavigate">
            Reports
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.medicines')" to="/pharmacy/dispensing" @click="onNavigate">
            Medicines
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.categories')" to="/pharmacy/dispensing" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.stock')" to="/pharmacy/batches" @click="onNavigate">
            Stock
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.issue')" to="/pharmacy/dispensing" @click="onNavigate">
            Medicine Issue
          </RouterLink>
        </div>
      </div>

      <!-- IPD -->
      <div class="menu-group" v-if="canSee('ipd')">
        <div class="menu-title" @click="toggle('ipd')">
          IPD / Inpatient
          <span>{{ menuOpen.ipd ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.ipd" class="submenu">
          <RouterLink v-if="canSee('ipd.admissions')" to="/ipd/admissions" @click="onNavigate">Admissions</RouterLink>
          <RouterLink v-if="canSee('ipd.bedBoard')" to="/ipd/bed-board" @click="onNavigate">Bed Board</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/ipd/nursing" @click="onNavigate">Nursing</RouterLink>
          <RouterLink v-if="canSee('ipd.mar')" to="/ipd/mar" @click="onNavigate">MAR</RouterLink>
          <RouterLink v-if="canSee('ipd.discharge')" to="/ipd/discharge" @click="onNavigate">Discharge</RouterLink>
          <div class="submenu-divider">Emergency / OT / ICU</div>
          <RouterLink v-if="canSee('ipd.admissions')" to="/emergency/triage" @click="onNavigate">Emergency Triage</RouterLink>
          <RouterLink v-if="canSee('ipd.admissions')" to="/emergency/encounters" @click="onNavigate">Emergency Encounters</RouterLink>
          <RouterLink v-if="canSee('ipd.bedBoard')" to="/emergency/observation-beds" @click="onNavigate">Observation Beds</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.er')" to="/emergency/er-workflow" @click="onNavigate">ER Workflow</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.mlc')" to="/emergency/mlc-register" @click="onNavigate">MLC Register</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/ot/procedures" @click="onNavigate">OT Procedures</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.otSurgery')" to="/ot/surgery-management" @click="onNavigate">Surgery Management</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/icu/workflows" @click="onNavigate">ICU Workflows</RouterLink>
        </div>
      </div>

      <!-- PAKISTAN MARKET -->
      <div class="menu-group" v-if="canSee('pakistanMarket')">
        <div class="menu-title" @click="toggle('pakistanMarket')">
          Pakistan Market
          <span>{{ menuOpen.pakistanMarket ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.pakistanMarket" class="submenu">
          <RouterLink v-if="canSee('pakistanMarket.sehatCard')" to="/finance/sehat-card-claims" @click="onNavigate">Sehat Card / SSP</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.panelBilling')" to="/finance/panel-billing" @click="onNavigate">Panel / TPA Billing</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.er')" to="/emergency/er-workflow" @click="onNavigate">Emergency / ER</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.mlc')" to="/emergency/mlc-register" @click="onNavigate">MLC / Police Case</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.otSurgery')" to="/ot/surgery-management" @click="onNavigate">OT / Surgery</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.maternity')" to="/maternity/labor-room" @click="onNavigate">Maternity / Newborn</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.regulatory')" to="/regulatory/government-reports" @click="onNavigate">Government Reports</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.welfare')" to="/welfare/charity-zakat" @click="onNavigate">Charity / Zakat</RouterLink>
          <RouterLink v-if="canSee('pakistanMarket.complaints')" to="/patient-facilitation/complaints" @click="onNavigate">Complaints Desk</RouterLink>
        </div>
      </div>

      <!-- INTEGRATION & AUTOMATION -->
      <div class="menu-group" v-if="canSee('integrationAutomation')">
        <div class="menu-title" @click="toggle('integrationAutomation')">
          Integration & Automation
          <span>{{ menuOpen.integrationAutomation ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.integrationAutomation" class="submenu">
          <RouterLink v-if="canSee('integrationAutomation.hub')" to="/integrations/hub" @click="onNavigate">Connector Hub</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.fbr')" to="/integrations/fbr-e-invoicing" @click="onNavigate">FBR E-Invoicing</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.provincialTax')" to="/integrations/provincial-tax" @click="onNavigate">Provincial Tax</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.aiMarketplace')" to="/ai/agent-marketplace" @click="onNavigate">AI Agent Marketplace</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.aiGovernance')" to="/ai/governance" @click="onNavigate">AI Governance</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.downtime')" to="/downtime/offline-queue" @click="onNavigate">Downtime Queue</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.documents')" to="/documents/management" @click="onNavigate">Documents / Scanning</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.biometric')" to="/identity/biometric-cnic" @click="onNavigate">Biometric / CNIC</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.multiBranch')" to="/enterprise/multi-branch" @click="onNavigate">Multi-Branch Controls</RouterLink>
          <RouterLink v-if="canSee('integrationAutomation.paymentGateways')" to="/payments/gateways" @click="onNavigate">Payment Gateways</RouterLink>
        </div>
      </div>

      <!-- INVENTORY -->
      <div class="menu-group" v-if="canSee('inventory')">
        <div class="menu-title" @click="toggle('inventory')">
          Inventory
          <span>{{ menuOpen.inventory ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.inventory" class="submenu">
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/procurement" @click="onNavigate">Procurement</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/suppliers" @click="onNavigate">Suppliers</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/requisitions" @click="onNavigate">Requisitions</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/purchase-orders" @click="onNavigate">Purchase Orders</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/receiving" @click="onNavigate">Receiving</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/stock-lots" @click="onNavigate">Stock Lots</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/expiry" @click="onNavigate">Expiry</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/adjustments" @click="onNavigate">Adjustments</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/stock-movements" @click="onNavigate">Stock Movements</RouterLink>
          <RouterLink v-if="canSee('inventory.reports')" to="/inventory/reports" @click="onNavigate">Inventory Reports</RouterLink>
        </div>
      </div>

      <!-- ANALYTICS -->
      <div class="menu-group" v-if="canSee('analytics')">
        <div class="menu-title" @click="toggle('analytics')">
          Analytics
          <span>{{ menuOpen.analytics ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.analytics" class="submenu">
          <RouterLink v-if="canSee('analytics.executive')" to="/analytics/executive" @click="onNavigate">Executive</RouterLink>
          <RouterLink v-if="canSee('analytics.clinical')" to="/analytics/clinical" @click="onNavigate">Clinical</RouterLink>
          <RouterLink v-if="canSee('analytics.finance')" to="/analytics/finance" @click="onNavigate">Finance</RouterLink>
          <RouterLink v-if="canSee('analytics.finance')" to="/analytics/exports" @click="onNavigate">Exports</RouterLink>
        </div>
      </div>

      <!-- PATIENT ENGAGEMENT -->
      <div class="menu-group" v-if="canSee('patientEngagement')">
        <div class="menu-title" @click="toggle('patientEngagement')">
          Patient Engagement
          <span>{{ menuOpen.patientEngagement ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.patientEngagement" class="submenu">
          <RouterLink v-if="canSee('patientEngagement.portal')" to="/patient-engagement/portal-accounts" @click="onNavigate">Portal Accounts</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.prescriptions')" to="/patient-engagement/prescription-access" @click="onNavigate">Prescription Access</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.notifications')" to="/patient-engagement/notifications" @click="onNavigate">Notifications</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.consents')" to="/patient-engagement/consents" @click="onNavigate">Consents</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.messages')" to="/patient-engagement/messages" @click="onNavigate">Messages</RouterLink>
        </div>
      </div>

      <!-- INTEROPERABILITY -->
      <div class="menu-group" v-if="canSee('interoperability')">
        <div class="menu-title" @click="toggle('interoperability')">
          Interoperability
          <span>{{ menuOpen.interoperability ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.interoperability" class="submenu">
          <RouterLink v-if="canSee('interoperability.outbox')" to="/interoperability/outbox" @click="onNavigate">Outbox & Retries</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/hl7-fhir" @click="onNavigate">HL7 / FHIR</RouterLink>
          <RouterLink v-if="canSee('interoperability.partners')" to="/interoperability/partners" @click="onNavigate">Partners</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/exchange" @click="onNavigate">External Exchange</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/webhooks" @click="onNavigate">Webhooks</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/pacs-dicom" @click="onNavigate">PACS / DICOM</RouterLink>
        </div>
      </div>

      <!-- QUALITY -->
      <div class="menu-group" v-if="canSee('quality')">
        <div class="menu-title" @click="toggle('quality')">
          Quality & Compliance
          <span>{{ menuOpen.quality ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.quality" class="submenu">
          <RouterLink v-if="canSee('quality.incidents')" to="/quality/incidents" @click="onNavigate">Incidents</RouterLink>
          <RouterLink v-if="canSee('quality.incidentActions')" to="/quality/incident-actions" @click="onNavigate">Incident Actions</RouterLink>
          <RouterLink v-if="canSee('quality.auditChecklists')" to="/quality/audit-checklists" @click="onNavigate">Audit Checklists</RouterLink>
          <RouterLink v-if="canSee('quality.auditFindings')" to="/quality/audit-findings" @click="onNavigate">Audit Findings</RouterLink>
          <RouterLink v-if="canSee('quality.complianceTasks')" to="/quality/compliance-tasks" @click="onNavigate">Compliance Tasks</RouterLink>
          <RouterLink v-if="canSee('quality.correctiveActions')" to="/quality/corrective-actions" @click="onNavigate">Corrective Actions</RouterLink>
          <RouterLink v-if="canSee('quality.riskRegister')" to="/quality/risk-register" @click="onNavigate">Risk Register</RouterLink>
          <RouterLink v-if="canSee('quality.infectionControl')" to="/quality/infection-control" @click="onNavigate">Infection Control</RouterLink>
          <RouterLink v-if="canSee('quality.mortalityReviews')" to="/quality/mortality-reviews" @click="onNavigate">Mortality Reviews</RouterLink>
          <RouterLink v-if="canSee('quality.reports')" to="/quality/reports" @click="onNavigate">Quality Reports</RouterLink>
        </div>
      </div>

      <!-- BLOOD BANK -->
      <div class="menu-group" v-if="canSee('bloodBank')">
        <div class="menu-title" @click="toggle('bloodBank')">
          Blood Bank
          <span>{{ menuOpen.bloodBank ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.bloodBank" class="submenu">
          <RouterLink v-if="canSee('bloodBank.donors')" to="/blood-bank/donors" @click="onNavigate">Donor Registry</RouterLink>
          <RouterLink v-if="canSee('bloodBank.units')" to="/blood-bank/blood-units" @click="onNavigate">Blood Units</RouterLink>
          <RouterLink v-if="canSee('bloodBank.crossMatching')" to="/blood-bank/cross-matching" @click="onNavigate">Cross Matching</RouterLink>
          <RouterLink v-if="canSee('bloodBank.issueReturn')" to="/blood-bank/issue-return" @click="onNavigate">Issue & Return</RouterLink>
          <RouterLink v-if="canSee('bloodBank.coldChain')" to="/blood-bank/cold-chain" @click="onNavigate">Cold Chain</RouterLink>
        </div>
      </div>

      <!-- ENTERPRISE LIS -->
      <div class="menu-group" v-if="canSee('enterpriseLis')">
        <div class="menu-title" @click="toggle('enterpriseLis')">
          Enterprise LIS
          <span>{{ menuOpen.enterpriseLis ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.enterpriseLis" class="submenu">
          <RouterLink v-if="canSee('enterpriseLis.outreach')" to="/lis/outreach-orders" @click="onNavigate">Outreach Orders</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.phlebotomy')" to="/lis/phlebotomy-collections" @click="onNavigate">Phlebotomy</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.accessioning')" to="/lis/accessioning-barcoding" @click="onNavigate">Accessioning</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.routing')" to="/lis/specimen-routing" @click="onNavigate">Specimen Routing</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.instruments')" to="/lis/instrument-worklists" @click="onNavigate">Instrument Worklists</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.pathology')" to="/lis/anatomic-pathology" @click="onNavigate">Anatomic Pathology</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.molecular')" to="/lis/molecular-diagnostics" @click="onNavigate">Molecular Diagnostics</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.microbiology')" to="/lis/microbiology" @click="onNavigate">Microbiology</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.verification')" to="/lis/auto-verification" @click="onNavigate">Auto Verification</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.reflex')" to="/lis/reflex-testing" @click="onNavigate">Reflex Testing</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.alerts')" to="/lis/critical-alerts" @click="onNavigate">Critical Alerts</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.reagents')" to="/lis/reagent-inventory" @click="onNavigate">Reagent Inventory</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.biobanking')" to="/lis/biobanking" @click="onNavigate">Biobanking</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.documents')" to="/lis/document-control" @click="onNavigate">Document Control</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.maintenance')" to="/lis/predictive-maintenance" @click="onNavigate">Predictive Maintenance</RouterLink>
          <RouterLink v-if="canSee('enterpriseLis.aiInterpretation')" to="/lis/ai-interpretation" @click="onNavigate">AI Interpretation</RouterLink>
        </div>
      </div>

      <!-- ADVANCED HMS -->
      <div class="menu-group" v-if="canSee('advancedHms')">
        <div class="menu-title" @click="toggle('advancedHms')">
          Advanced HMS
          <span>{{ menuOpen.advancedHms ? '-' : '+' }}</span>
        </div>
        <div v-if="menuOpen.advancedHms" class="submenu">
          <RouterLink v-if="canSee('advancedHms.aiScribe')" to="/clinical/ai-voice-scribe" @click="onNavigate">AI Voice Scribe</RouterLink>
          <RouterLink v-if="canSee('advancedHms.telemedicine')" to="/telemedicine/workspace" @click="onNavigate">Telemedicine Workspace</RouterLink>
          <RouterLink v-if="canSee('advancedHms.pacsViewer')" to="/radiology/pacs-viewer" @click="onNavigate">PACS Image Viewer</RouterLink>
          <RouterLink v-if="canSee('advancedHms.abdmAbha')" to="/interoperability/abdm-abha" @click="onNavigate">ABDM / ABHA</RouterLink>
        </div>
      </div>

      <!-- REPORTS -->
      <div class="menu-group" v-if="canSee('reports')">
        <div class="menu-title" @click="toggle('reports')">
          Reports
          <span>{{ menuOpen.reports ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.reports" class="submenu">
          <RouterLink v-if="canSee('reports.patient')" to="/dashboard" @click="onNavigate">
            Patient Reports
          </RouterLink>
          <RouterLink v-if="canSee('reports.finance')" to="/dashboard" @click="onNavigate">
            Financial Reports
          </RouterLink>
          <RouterLink v-if="canSee('reports.lab')" to="/dashboard" @click="onNavigate">
            Lab Reports
          </RouterLink>
        </div>
      </div>

      <!-- ADMIN -->
      <div class="menu-group" v-if="canSee('admin')">
        <div class="menu-title" @click="toggle('admin')">
          Administration
          <span>{{ menuOpen.admin ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.admin" class="submenu">
          <RouterLink v-if="canSee('admin.company')" to="/company-info" @click="onNavigate">
            Company Info
          </RouterLink>

          <RouterLink v-if="canSee('admin.paymentCategories')" to="/admin/payment-categories" @click="onNavigate">
            Payment Categories
          </RouterLink>

          <RouterLink v-if="canSee('admin.users')" to="/admin/users" @click="onNavigate">
            Users
          </RouterLink>

          <RouterLink v-if="canSee('admin.audit')" to="/admin/audit" @click="onNavigate">
            Audit Viewer
          </RouterLink>

          <RouterLink v-if="canSee('admin.permissionSync')" to="/admin/permission-sync" @click="onNavigate">
            Permission Sync
          </RouterLink>

          <RouterLink v-if="canSee('admin.observability')" to="/admin/observability" @click="onNavigate">
            Observability
          </RouterLink>

          <RouterLink v-if="canSee('admin.roles')" to="/dashboard" @click="onNavigate">
            Roles & Permissions
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { canSeeMenuItem } from '@/security/permissions'

/**
 * `open` prop controls drawer visibility on mobile/tablet
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const auth = useAuthStore()
const route = useRoute()

/**
 * Rename accordion state to avoid collision with prop `open`
 */
const menuOpen = reactive({
  patients: false,
  hr: false,
  lab: false,
  pharmacy: false,
  ipd: false,
  inventory: false,
  analytics: false,
  patientEngagement: false,
  interoperability: false,
  pakistanMarket: false,
  integrationAutomation: false,
  quality: false,
  bloodBank: false,
  enterpriseLis: false,
  advancedHms: false,
  billing: false,
  reports: false,
  admin: false,
})

function toggle(key: keyof typeof menuOpen) {
  Object.keys(menuOpen).forEach((k) => {
    menuOpen[k as keyof typeof menuOpen] = false
  })
  menuOpen[key] = true
}

function onNavigate() {
  emit('close')
}

const canSee = (key: string): boolean => canSeeMenuItem(key, auth.permissions)

/**
 * Auto-close drawer when route changes (mobile UX)
 */
watch(
  () => route.fullPath,
  () => {
    if (props.open) emit('close')
  }
)
</script>

<style scoped>
.sidebar {
  width: 270px;
  background:
    linear-gradient(180deg, rgba(15, 118, 110, 0.24), transparent 280px),
    linear-gradient(180deg, var(--sidebar-bg-2), var(--sidebar-bg));
  color: var(--sidebar-text);
  padding: 18px 14px;
  overflow-y: auto;
  border-right: 1px solid rgba(148, 163, 184, 0.22);
}

/* brand row */
.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.brand {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0;
}

/* close button (mobile only) */
.close {
  display: none;
  border: none;
  background: rgba(226, 232, 240, 0.12);
  color: var(--sidebar-text);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
}

/* Drawer behavior on mobile/tablet */
@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 18px 0 44px rgba(15, 23, 42, 0.28);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

/* menu styles */
.menu-title {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  color: var(--sidebar-text);
}

.menu-title:hover {
  background: var(--sidebar-hover);
}

.submenu {
  padding-left: 8px;
  margin-bottom: 6px;
}

.submenu a {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--sidebar-muted);
  text-decoration: none;
  border-left: 3px solid transparent;
}

.submenu a:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text);
}

.submenu a.router-link-active {
  background: var(--sidebar-active);
  color: #ffffff;
  font-weight: 600;
  border-left-color: #2dd4bf;
}

.submenu-divider {
  margin: 8px 0 4px;
  font-size: 11px;
  color: #7dd3fc;
  text-transform: uppercase;
}

.menu-title.single-link {
  text-decoration: none;
  color: var(--sidebar-text);
}

.menu-title.single-link.router-link-active {
  background: var(--sidebar-active);
  color: #ffffff;
  font-weight: 600;
  border-left: 4px solid #2dd4bf;
}
</style>
