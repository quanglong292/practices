import { db } from "../config/db";
import { RuleService } from "../services/rule.service";
import { HttpResponse } from "../utils/response";

// GET /rules
export const getAllRules = async ({ query, set }: any) => {
  try {
    const rules = await db.dynamic_rules.findMany({
      where: query?.rule_type ? { rule_type: query.rule_type } : undefined,
      orderBy: { rule_id: "asc" },
    });
    return HttpResponse.success(rules, "Rules fetched successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};

// POST /rules
export const createRule = async ({ body, set }: any) => {
  try {
    const rule = await db.dynamic_rules.create({
      data: {
        form_id: body.form_id ?? null,
        column_id: body.column_id ?? null,
        rule_type: body.rule_type,
        rule_expression: body.rule_expression,
        error_message: body.error_message ?? null,
      },
    });

    // Invalidate cache if rule is form-scoped
    if (body.form_id) {
      const form = await db.forms.findUnique({ where: { form_id: body.form_id } });
      if (form) await RuleService.invalidateCache(form.form_code);
    }

    set.status = 201;
    return HttpResponse.success(rule, "Rule created successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};

// DELETE /rules/:rule_id
export const deleteRule = async ({ params, set }: any) => {
  try {
    await db.dynamic_rules.delete({
      where: { rule_id: Number(params.rule_id) },
    });
    return HttpResponse.success(null, "Rule deleted successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};
