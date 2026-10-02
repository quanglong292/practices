import Elysia from "elysia";
import {
  getAllForms,
  getFormByCode,
  createForm,
} from "../controllers/form.controller";
import { CreateFormSchema } from "../schemas/payload.schema";

export const formRoutes = new Elysia({ prefix: "/forms" })
  .get("/", getAllForms)
  .get("/:form_code", getFormByCode)
  .post("/", createForm, { body: CreateFormSchema });
