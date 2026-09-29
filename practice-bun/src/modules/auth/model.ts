import { t, type UnwrapSchema } from "elysia";

export const AuthModel = {
  signInBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6 }),
  }),

  signUpBody: t.Object({
    name: t.String({ minLength: 2 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6 }),
  }),

  authResponse: t.Object({
    token: t.String(),
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      role: t.String(),
    }),
  }),
} as const;

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};

export type SignInInput = AuthModel["signInBody"];
export type SignUpInput = AuthModel["signUpBody"];
