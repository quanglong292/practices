import { PrismaClient } from "@prisma/client";
import { encodeBlob } from "../src/services/eav.service";

const prisma = new PrismaClient();

// ─── Data Type Enum (matches legacy system) ───────────────────────────────────
const DATA_TYPE = {
  TEXT: 1,
  NUMBER: 2,
  DATE: 3,
  BOOLEAN: 4,
  SELECT: 5,
  EMAIL: 6,
} as const;

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Clean existing data (order matters for FK constraints) ─────────────
  console.log("🧹 Clearing existing data...");
  await prisma.sales_field_cache.deleteMany();
  await prisma.sales_numbers.deleteMany();
  await prisma.dynamic_rules.deleteMany();
  await prisma.form_columns.deleteMany();
  await prisma.forms.deleteMany();
  await prisma.columns.deleteMany();
  console.log("   ✔ Done\n");

  // ── 2. Seed Columns (Field Definitions) ───────────────────────────────────
  console.log("📋 Seeding columns...");

  // --- Group: Personal Info (parent) ---
  const groupPersonal = await prisma.columns.create({
    data: {
      column_label: "Personal Information",
      data_type: DATA_TYPE.TEXT,
      is_require: false,
    },
  });

  const colFullName = await prisma.columns.create({
    data: {
      parent_id: groupPersonal.column_id,
      column_label: "Full Name",
      data_type: DATA_TYPE.TEXT,
      is_require: true,
    },
  });

  const colEmail = await prisma.columns.create({
    data: {
      parent_id: groupPersonal.column_id,
      column_label: "Email Address",
      data_type: DATA_TYPE.EMAIL,
      is_require: true,
    },
  });

  const colPhone = await prisma.columns.create({
    data: {
      parent_id: groupPersonal.column_id,
      column_label: "Phone Number",
      data_type: DATA_TYPE.TEXT,
      is_require: false,
    },
  });

  const colDOB = await prisma.columns.create({
    data: {
      parent_id: groupPersonal.column_id,
      column_label: "Date of Birth",
      data_type: DATA_TYPE.DATE,
      is_require: false,
    },
  });

  // --- Group: Employment Info (parent) ---
  const groupEmployment = await prisma.columns.create({
    data: {
      column_label: "Employment Information",
      data_type: DATA_TYPE.TEXT,
      is_require: false,
    },
  });

  const colCompanyName = await prisma.columns.create({
    data: {
      parent_id: groupEmployment.column_id,
      column_label: "Company Name",
      data_type: DATA_TYPE.TEXT,
      is_require: true,
    },
  });

  const colPosition = await prisma.columns.create({
    data: {
      parent_id: groupEmployment.column_id,
      column_label: "Position / Job Title",
      data_type: DATA_TYPE.TEXT,
      is_require: true,
    },
  });

  const colSalary = await prisma.columns.create({
    data: {
      parent_id: groupEmployment.column_id,
      column_label: "Annual Salary (JPY)",
      data_type: DATA_TYPE.NUMBER,
      is_require: true,
      default_data: "0",
    },
  });

  const colEmploymentType = await prisma.columns.create({
    data: {
      parent_id: groupEmployment.column_id,
      column_label: "Employment Type",
      data_type: DATA_TYPE.SELECT, // FULL_TIME | PART_TIME | CONTRACT | FREELANCE
      is_require: true,
      default_data: "FULL_TIME",
    },
  });

  // --- Group: Contract Details (parent) ---
  const groupContract = await prisma.columns.create({
    data: {
      column_label: "Contract Details",
      data_type: DATA_TYPE.TEXT,
      is_require: false,
    },
  });

  const colContractStart = await prisma.columns.create({
    data: {
      parent_id: groupContract.column_id,
      column_label: "Contract Start Date",
      data_type: DATA_TYPE.DATE,
      is_require: true,
    },
  });

  const colContractEnd = await prisma.columns.create({
    data: {
      parent_id: groupContract.column_id,
      column_label: "Contract End Date",
      data_type: DATA_TYPE.DATE,
      is_require: false,
    },
  });

  const colContractValue = await prisma.columns.create({
    data: {
      parent_id: groupContract.column_id,
      column_label: "Contract Value (JPY)",
      data_type: DATA_TYPE.NUMBER,
      is_require: true,
      default_data: "0",
    },
  });

  const colIsRenewal = await prisma.columns.create({
    data: {
      parent_id: groupContract.column_id,
      column_label: "Is Renewal Contract",
      data_type: DATA_TYPE.BOOLEAN,
      is_require: false,
      default_data: "false",
    },
  });

  const colNotes = await prisma.columns.create({
    data: {
      column_label: "Notes / Remarks",
      data_type: DATA_TYPE.TEXT,
      is_require: false,
    },
  });

  console.log(`   ✔ Created ${15} columns\n`);

  // ── 3. Seed Forms ──────────────────────────────────────────────────────────
  console.log("📝 Seeding forms...");

  const formContractJP = await prisma.forms.create({
    data: {
      form_code: "CONTRACT_JP",
      form_name: "Japan Standard Contract Form",
      is_active: true,
    },
  });

  const formContractPart = await prisma.forms.create({
    data: {
      form_code: "CONTRACT_PART_TIME",
      form_name: "Part-Time Contract Form",
      is_active: true,
    },
  });

  const formLeadCapture = await prisma.forms.create({
    data: {
      form_code: "LEAD_CAPTURE",
      form_name: "Lead Capture Form",
      is_active: true,
    },
  });

  console.log("   ✔ Created 3 forms\n");

  // ── 4. Seed Form-Column Mappings ───────────────────────────────────────────
  console.log("🔗 Seeding form_columns...");

  // CONTRACT_JP — full form with all fields
  const contractJPColumns = [
    { column_id: colFullName.column_id, sort_order: 1, is_required_override: true },
    { column_id: colEmail.column_id, sort_order: 2, is_required_override: true },
    { column_id: colPhone.column_id, sort_order: 3, is_required_override: false },
    { column_id: colDOB.column_id, sort_order: 4, is_required_override: false },
    { column_id: colCompanyName.column_id, sort_order: 5, is_required_override: true },
    { column_id: colPosition.column_id, sort_order: 6, is_required_override: true },
    { column_id: colSalary.column_id, sort_order: 7, is_required_override: true },
    { column_id: colEmploymentType.column_id, sort_order: 8, is_required_override: true },
    { column_id: colContractStart.column_id, sort_order: 9, is_required_override: true },
    { column_id: colContractEnd.column_id, sort_order: 10, is_required_override: false },
    { column_id: colContractValue.column_id, sort_order: 11, is_required_override: true },
    { column_id: colIsRenewal.column_id, sort_order: 12, is_required_override: false },
    { column_id: colNotes.column_id, sort_order: 13, is_required_override: false },
  ];

  await prisma.form_columns.createMany({
    data: contractJPColumns.map((c) => ({
      form_id: formContractJP.form_id,
      ...c,
    })),
  });

  // CONTRACT_PART_TIME — subset (no contract value, simplified)
  await prisma.form_columns.createMany({
    data: [
      { form_id: formContractPart.form_id, column_id: colFullName.column_id, sort_order: 1, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colEmail.column_id, sort_order: 2, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colPhone.column_id, sort_order: 3, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colCompanyName.column_id, sort_order: 4, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colSalary.column_id, sort_order: 5, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colContractStart.column_id, sort_order: 6, is_required_override: true },
      { form_id: formContractPart.form_id, column_id: colNotes.column_id, sort_order: 7, is_required_override: false },
    ],
  });

  // LEAD_CAPTURE — minimal info only
  await prisma.form_columns.createMany({
    data: [
      { form_id: formLeadCapture.form_id, column_id: colFullName.column_id, sort_order: 1, is_required_override: true },
      { form_id: formLeadCapture.form_id, column_id: colEmail.column_id, sort_order: 2, is_required_override: true },
      { form_id: formLeadCapture.form_id, column_id: colPhone.column_id, sort_order: 3, is_required_override: false },
      { form_id: formLeadCapture.form_id, column_id: colCompanyName.column_id, sort_order: 4, is_required_override: false },
      { form_id: formLeadCapture.form_id, column_id: colNotes.column_id, sort_order: 5, is_required_override: false },
    ],
  });

  console.log("   ✔ Mapped all columns to forms\n");

  // ── 5. Seed Dynamic Rules (JsonLogic) ─────────────────────────────────────
  console.log("⚙️  Seeding dynamic_rules...");

  await prisma.dynamic_rules.createMany({
    data: [
      // ── Form-Level: CONTRACT_JP ───────────────────────────────────────────

      // Rule 1: Contract value must be > 0
      {
        form_id: formContractJP.form_id,
        column_id: null,
        rule_type: "VALIDATION",
        rule_expression: { ">": [{ var: String(colContractValue.column_id) }, 0] },
        error_message: "Contract value must be greater than 0.",
      },

      // Rule 2: Contract value cannot exceed 100,000,000 JPY (sanity cap)
      {
        form_id: formContractJP.form_id,
        column_id: null,
        rule_type: "VALIDATION",
        rule_expression: { "<=": [{ var: String(colContractValue.column_id) }, 100_000_000] },
        error_message: "Contract value cannot exceed ¥100,000,000.",
      },

      // Rule 3: Salary must be >= 1,040,000 JPY (Japan minimum wage * 12 months, approx)
      {
        form_id: formContractJP.form_id,
        column_id: null,
        rule_type: "VALIDATION",
        rule_expression: { ">=": [{ var: String(colSalary.column_id) }, 1_040_000] },
        error_message: "Annual salary must be at least ¥1,040,000 (Japan minimum wage).",
      },

      // ── Form-Level: CONTRACT_PART_TIME ────────────────────────────────────

      // Rule 4: Part-time salary cap (max ¥5,000,000)
      {
        form_id: formContractPart.form_id,
        column_id: null,
        rule_type: "VALIDATION",
        rule_expression: { "<=": [{ var: String(colSalary.column_id) }, 5_000_000] },
        error_message: "Part-time annual salary cannot exceed ¥5,000,000.",
      },

      // Rule 5: Part-time salary must be > 0
      {
        form_id: formContractPart.form_id,
        column_id: null,
        rule_type: "VALIDATION",
        rule_expression: { ">": [{ var: String(colSalary.column_id) }, 0] },
        error_message: "Salary must be greater than 0.",
      },

      // ── Field-Level Rules ─────────────────────────────────────────────────

      // Rule 6: Salary field — VISIBILITY: only show if employment type is not empty
      // (simulated: salary > 0 implies it was entered)
      {
        form_id: null,
        column_id: colSalary.column_id,
        rule_type: "VISIBILITY",
        rule_expression: { "!=": [{ var: String(colEmploymentType.column_id) }, ""] },
        error_message: null,
      },

      // Rule 7: Contract end date — VISIBILITY: only show for renewal contracts
      {
        form_id: null,
        column_id: colContractEnd.column_id,
        rule_type: "VISIBILITY",
        rule_expression: { "==": [{ var: String(colIsRenewal.column_id) }, true] },
        error_message: null,
      },

      // Rule 8: Contract value — CALCULATION: auto-derive estimate (salary * 1.3)
      // (illustrative — actual calculation done server-side)
      {
        form_id: formContractJP.form_id,
        column_id: colContractValue.column_id,
        rule_type: "CALCULATION",
        rule_expression: { "*": [{ var: String(colSalary.column_id) }, 1.3] },
        error_message: null,
      },
    ],
  });

  console.log("   ✔ Created 8 dynamic rules\n");

  // ── 6. Seed Sales Records & EAV Field Cache ────────────────────────────────
  console.log("💼 Seeding sales_numbers + sales_field_cache...");

  const salesRecords = [
    {
      company_id: 1001,
      fields: [
        { field_id: colFullName.column_id, val: "Tanaka Hiroshi" },
        { field_id: colEmail.column_id, val: "tanaka.hiroshi@acme.co.jp" },
        { field_id: colPhone.column_id, val: "+81-90-1234-5678" },
        { field_id: colCompanyName.column_id, val: "ACME Japan K.K." },
        { field_id: colPosition.column_id, val: "Senior Engineer" },
        { field_id: colSalary.column_id, val: 7_500_000 },
        { field_id: colEmploymentType.column_id, val: "FULL_TIME" },
        { field_id: colContractStart.column_id, val: "2026-04-01" },
        { field_id: colContractValue.column_id, val: 9_750_000 },
        { field_id: colIsRenewal.column_id, val: false },
      ],
    },
    {
      company_id: 1002,
      fields: [
        { field_id: colFullName.column_id, val: "Yamamoto Yuki" },
        { field_id: colEmail.column_id, val: "yuki.yamamoto@globex.jp" },
        { field_id: colPhone.column_id, val: "+81-80-9876-5432" },
        { field_id: colCompanyName.column_id, val: "Globex Corporation" },
        { field_id: colPosition.column_id, val: "Project Manager" },
        { field_id: colSalary.column_id, val: 9_200_000 },
        { field_id: colEmploymentType.column_id, val: "FULL_TIME" },
        { field_id: colContractStart.column_id, val: "2026-01-15" },
        { field_id: colContractEnd.column_id, val: "2027-01-14" },
        { field_id: colContractValue.column_id, val: 11_960_000 },
        { field_id: colIsRenewal.column_id, val: true },
        { field_id: colNotes.column_id, val: "Annual renewal — performance bonus included." },
      ],
    },
    {
      company_id: 1001,
      fields: [
        { field_id: colFullName.column_id, val: "Sato Kenji" },
        { field_id: colEmail.column_id, val: "sato.kenji@acme.co.jp" },
        { field_id: colPhone.column_id, val: "+81-70-5555-0000" },
        { field_id: colCompanyName.column_id, val: "ACME Japan K.K." },
        { field_id: colPosition.column_id, val: "Part-time Support" },
        { field_id: colSalary.column_id, val: 2_400_000 },
        { field_id: colEmploymentType.column_id, val: "PART_TIME" },
        { field_id: colContractStart.column_id, val: "2026-07-01" },
        { field_id: colNotes.column_id, val: "Weekday only, 4 hours/day." },
      ],
    },
    {
      company_id: 1003,
      fields: [
        { field_id: colFullName.column_id, val: "Emily Chen" },
        { field_id: colEmail.column_id, val: "emily.chen@techstart.io" },
        { field_id: colPhone.column_id, val: "+81-90-3333-7777" },
        { field_id: colCompanyName.column_id, val: "TechStart Inc." },
        { field_id: colPosition.column_id, val: "Lead Designer" },
        { field_id: colSalary.column_id, val: 8_000_000 },
        { field_id: colEmploymentType.column_id, val: "CONTRACT" },
        { field_id: colContractStart.column_id, val: "2026-03-01" },
        { field_id: colContractEnd.column_id, val: "2026-09-30" },
        { field_id: colContractValue.column_id, val: 5_200_000 },
        { field_id: colIsRenewal.column_id, val: false },
        { field_id: colNotes.column_id, val: "6-month project contract — UI/UX overhaul." },
      ],
    },
    {
      company_id: 1004,
      fields: [
        { field_id: colFullName.column_id, val: "Nakamura Ryota" },
        { field_id: colEmail.column_id, val: "ryota.n@freelance.dev" },
        { field_id: colCompanyName.column_id, val: "Self-Employed" },
        { field_id: colPosition.column_id, val: "Backend Developer" },
        { field_id: colSalary.column_id, val: 12_000_000 },
        { field_id: colEmploymentType.column_id, val: "FREELANCE" },
        { field_id: colContractStart.column_id, val: "2026-06-01" },
        { field_id: colContractValue.column_id, val: 15_600_000 },
        { field_id: colIsRenewal.column_id, val: false },
      ],
    },
  ];

  for (const record of salesRecords) {
    const sales = await prisma.sales_numbers.create({
      data: { company_id: record.company_id },
    });

    await prisma.sales_field_cache.createMany({
      data: record.fields.map((f) => ({
        sales_id: sales.sales_id,
        data_value: encodeBlob(f.field_id, f.val),
        update_date: new Date(),
      })),
    });

    console.log(`   ✔ Sales #${sales.sales_id} — ${record.fields.find(f => f.field_id === colFullName.column_id)?.val}`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("─────────────────────────────────────────");
  console.log("  Columns      : 15");
  console.log("  Forms        : 3  (CONTRACT_JP, CONTRACT_PART_TIME, LEAD_CAPTURE)");
  console.log("  Dynamic Rules: 8  (VALIDATION, VISIBILITY, CALCULATION)");
  console.log("  Sales Records: 5  (with EAV field cache populated)");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
