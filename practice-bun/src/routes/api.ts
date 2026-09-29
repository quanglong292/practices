import { Elysia } from "elysia";
import { config } from "@/config";
import { auth } from "@/modules/auth";
import { users } from "@/modules/users";

export const apiRoutes = new Elysia({ prefix: config.apiPrefix, name: "routes.api" })
  .use(auth)
  .use(users);
