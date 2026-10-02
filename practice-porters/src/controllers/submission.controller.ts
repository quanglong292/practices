import { db } from "../config/db";
import { EavService } from "../services/eav.service";
import { RuleService } from "../services/rule.service";
import { HttpResponse } from "../utils/response";

// POST /submit
export const submitContract = async ({ body, set }: any) => {
  try {
    const { sales_id, form_code, fields } = body;

    // 1. Verify the sales record exists
    const salesRecord = await db.sales_numbers.findUnique({
      where: { sales_id },
    });

    if (!salesRecord) {
      set.status = 404;
      return HttpResponse.error(`Sales record ${sales_id} not found`, 404);
    }

    // 2. Persist incoming field values
    await EavService.upsertFields(sales_id, fields);

    // 3. Build flat payload for rule evaluation (merge saved + incoming)
    const flatPayload = await EavService.flattenPayload(sales_id);

    // 4. Evaluate Rule Engine
    const result = await RuleService.evaluate(form_code, flatPayload);

    if (!result.isValid) {
      set.status = 400;
      return HttpResponse.error(
        result.errorMessage ?? "Rule violation",
        "RULE_VIOLATION",
        result.violations,
      );
    }

    set.status = 201;
    return HttpResponse.success(
      { sales_id, flat_payload: flatPayload },
      "Contract validated and saved successfully",
    );
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};

// GET /submit/:sales_id
export const getSubmission = async ({ params, set }: any) => {
  try {
    const salesId = Number(params.sales_id);
    const flatPayload = await EavService.flattenPayload(salesId);

    if (Object.keys(flatPayload).length === 0) {
      set.status = 404;
      return HttpResponse.error(`No data found for sales_id ${salesId}`, 404);
    }

    return HttpResponse.success(flatPayload, "Submission data fetched");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};
