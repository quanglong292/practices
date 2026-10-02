import jsonLogic from "json-logic-js";
import { db } from "../config/db";
import { redis } from "../config/redis";

const CACHE_TTL = 300; // 5 minutes

interface RuleResult {
  isValid: boolean;
  errorMessage?: string;
  violations: string[];
}

export const RuleService = {
  /**
   * Fetches rules for a given form_code from Redis cache or DB.
   */
  async getRulesForForm(formCode: string): Promise<any[]> {
    const cacheKey = `rules:form:${formCode}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const form = await db.forms.findFirst({
      where: { form_code: formCode, is_active: true },
      include: {
        dynamic_rules: true,
        form_columns: {
          include: {
            columns: {
              include: { dynamic_rules: true },
            },
          },
        },
      },
    });

    if (!form) return [];

    // Merge form-level + field-level rules
    const formRules = form.dynamic_rules ?? [];
    const fieldRules = form.form_columns.flatMap(
      (fc) => fc.columns.dynamic_rules ?? [],
    );
    const allRules = [...formRules, ...fieldRules];

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(allRules));
    return allRules;
  },

  /**
   * Evaluates all active rules against a flattened data payload.
   * Returns isValid=false with the first violation message on failure.
   */
  async evaluate(
    formCode: string,
    flatPayload: Record<string, any>,
  ): Promise<RuleResult> {
    const rules = await this.getRulesForForm(formCode);
    const violations: string[] = [];

    for (const rule of rules) {
      if (rule.rule_type !== "VALIDATION") continue;

      try {
        const passes = jsonLogic.apply(rule.rule_expression, flatPayload);
        if (!passes) {
          violations.push(rule.error_message ?? `Rule ${rule.rule_id} failed`);
        }
      } catch (err: any) {
        console.error(`[RuleService] Error evaluating rule ${rule.rule_id}:`, err);
      }
    }

    return {
      isValid: violations.length === 0,
      errorMessage: violations[0],
      violations,
    };
  },

  /**
   * Invalidates the Redis cache for a given form so stale rules are not served.
   */
  async invalidateCache(formCode: string): Promise<void> {
    await redis.del(`rules:form:${formCode}`);
  },
};
