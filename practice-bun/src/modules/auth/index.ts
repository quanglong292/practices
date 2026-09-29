import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";

export const auth = new Elysia({ prefix: "/auth" })
  // POST /api/auth/sign-in
  .post(
    "/sign-in",
    async ({ body, cookie: { session } }) => {
      const response = await AuthService.signIn(body);

      // Store session token in cookie (Elysia handles cookie proxying)
      if (session) {
        session.value = response.token;
        session.httpOnly = true;
        session.path = "/";
      }

      return response;
    },
    {
      body: AuthModel.signInBody,
      detail: {
        tags: ["Auth"],
        summary: "User sign in",
      },
    }
  )

  // POST /api/auth/sign-up
  .post(
    "/sign-up",
    async ({ body, cookie: { session }, set }) => {
      const response = await AuthService.signUp(body);
      set.status = 201;

      if (session) {
        session.value = response.token;
        session.httpOnly = true;
        session.path = "/";
      }

      return response;
    },
    {
      body: AuthModel.signUpBody,
      detail: {
        tags: ["Auth"],
        summary: "User sign up",
      },
    }
  );
