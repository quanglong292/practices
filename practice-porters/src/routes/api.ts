import Elysia from "elysia";
import { formRoutes } from "./form.routes";
import {
  getAllRules,
  createRule,
  deleteRule,
} from "../controllers/rule.controller";
import {
  submitContract,
  getSubmission,
} from "../controllers/submission.controller";
import {
  CreateRuleSchema,
  SubmissionPayloadSchema,
} from "../schemas/payload.schema";

export const apiRouter = new Elysia({ prefix: "/api" })
  // ── Form Routes ──────────────────────────────────────────────────────────────
  .use(formRoutes)

  // ── Rule Routes ───────────────────────────────────────────────────────────────
  .get("/rules", getAllRules)
  .post("/rules", createRule, { body: CreateRuleSchema })
  .delete("/rules/:rule_id", deleteRule)

  // ── Submission Routes ─────────────────────────────────────────────────────────
  .post("/submit", submitContract, { body: SubmissionPayloadSchema })
  .get("/submit/:sales_id", getSubmission);
