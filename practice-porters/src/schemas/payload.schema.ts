import { t } from "elysia";

// ─── Field Value Payload ──────────────────────────────────────────────────────
export const FieldValueSchema = t.Object({
  field_id: t.Number(),
  data_value: t.Any(),
});

// ─── Submission Payload ───────────────────────────────────────────────────────
export const SubmissionPayloadSchema = t.Object({
  sales_id: t.Number(),
  form_code: t.String(),
  fields: t.Array(FieldValueSchema),
});

// ─── Rule Create Payload ──────────────────────────────────────────────────────
export const CreateRuleSchema = t.Object({
  form_id: t.Optional(t.Number()),
  column_id: t.Optional(t.Number()),
  rule_type: t.Union([
    t.Literal("VALIDATION"),
    t.Literal("VISIBILITY"),
    t.Literal("CALCULATION"),
  ]),
  rule_expression: t.Any(),
  error_message: t.Optional(t.String()),
});

// ─── Form Create Payload ──────────────────────────────────────────────────────
export const CreateFormSchema = t.Object({
  form_code: t.String(),
  form_name: t.String(),
  is_active: t.Optional(t.Boolean()),
});
