# Marketing Demo Readiness

## Marketable now

- Patient registration and patient list
- OPD/checkup workflow with vitals, medicines, lab/radiology order capture, and doctor fee
- Billing payments, receipt detail, receipt print, thermal print, refunds/claim workflow buttons
- Dashboard overview
- HR basics: departments, designations, workforce, attendance, leave, payroll, credentials, training, appraisals
- Finance basics: chart of accounts, expense vouchers, revenue voucher view/reversal, counter closing, daily closing
- Admin basics: company info, payment categories, users, audit logs, observability

## Hidden from sidebar by default

These routes remain available for DTO audit and backend integration, but are not marketed as complete yet:

- Pharmacy
- Lab/radiology
- IPD, Emergency, OT, ICU
- Inventory/procurement
- Analytics exports beyond dashboard basics
- Patient engagement
- Interoperability

Set `VITE_SHOW_ADVANCED_DEMO_MODULES=true` only for internal review of those enterprise workspaces.

## Demo script

1. Login with the seeded demo admin.
2. Open Patient Management, register a patient with realistic contact, gender, age, address, and profile data.
3. Open Checkups / Visits and start a new OPD/checkup for that patient.
4. Select doctor, visit metadata, vitals, diagnosis notes, medicine details, and lab/radiology orders.
5. Save the checkup and confirm the queue/list updates.
6. Open Payment, create a payment for the same patient, select payment mode/account, and save.
7. Open the payment detail and print the receipt or thermal receipt.
8. Return to Dashboard and show patient, doctor, appointment, and revenue cards.
9. Show HR basics: departments, designations, workforce, attendance, leave, and payroll.
10. Show finance basics: chart of accounts, expense vouchers, counter closing, and daily closing.
11. Show Audit Logs and Observability to demonstrate operational controls.

## Testing checklist

- [x] `npm run build`
- [x] `npm run test:routes`
- [ ] Manual browser check: login, register patient, OPD/checkup, payment, receipt print
- [ ] Browser network check: tenant/property headers, idempotency keys, audit reason headers on sensitive actions
- [ ] Role/permission check: demo user sees only permitted core routes
- [ ] Tenant/property switching check: context bar changes request headers and filtered data
- [ ] Delete/cancel/reversal flow check where backend endpoints are enabled

## Demo data guidance

- Use one facility/property consistently across patients, doctors, departments, HR, and finance.
- Use human names and real department names: OPD, Emergency, Radiology, Laboratory, Pharmacy, Finance, HR.
- Use stable demo patient examples such as `Ayesha Khan`, `Bilal Ahmed`, and `Fatima Noor`.
- Seed at least one doctor with a fee, one payment mode, one payment account, one department, one designation, one employee, one chart-of-account branch, and one printable payment.
- Use `docs/demo-data.json` as the canonical lightweight demo dataset until a backend seed script is wired.
- Do not claim all modules are complete until the DTO audit has no `Missing form`, `Partially implemented`, or `Unclear / needs backend confirmation` items for the modules being marketed.
