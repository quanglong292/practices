import { db } from "../config/db";
import { HttpResponse } from "../utils/response";

// GET /forms
export const getAllForms = async ({ query, set }: any) => {
  try {
    const forms = await db.forms.findMany({
      where: { is_active: query?.active !== "false" },
      orderBy: { form_id: "asc" },
    });
    return HttpResponse.success(forms, "Forms fetched successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};

// GET /forms/:form_code
export const getFormByCode = async ({ params, set }: any) => {
  try {
    const form = await db.forms.findFirst({
      where: { form_code: params.form_code },
      include: {
        form_columns: {
          orderBy: { sort_order: "asc" },
          include: { columns: true },
        },
        dynamic_rules: true,
      },
    });

    if (!form) {
      set.status = 404;
      return HttpResponse.error(`Form '${params.form_code}' not found`, 404);
    }

    return HttpResponse.success(form, "Form fetched successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};

// POST /forms
export const createForm = async ({ body, set }: any) => {
  try {
    const form = await db.forms.create({
      data: {
        form_code: body.form_code,
        form_name: body.form_name,
        is_active: body.is_active ?? true,
      },
    });
    set.status = 201;
    return HttpResponse.success(form, "Form created successfully");
  } catch (err: any) {
    set.status = 500;
    return HttpResponse.error("Internal Server Error", 500, err.message);
  }
};
