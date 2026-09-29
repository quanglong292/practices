import { t, type UnwrapSchema } from "elysia";

export const UserModel = {
  user: t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String({ format: "email" }),
    role: t.Union([t.Literal("admin"), t.Literal("user")]),
    createdAt: t.String(),
  }),

  createUserBody: t.Object({
    name: t.String({ minLength: 2, maxLength: 50 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6, maxLength: 100 }),
    role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
  }),

  updateUserBody: t.Object({
    name: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
    email: t.Optional(t.String({ format: "email" })),
    role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
  }),

  userIdParams: t.Object({
    id: t.String({ minLength: 1 }),
  }),

  usersQuery: t.Object({
    limit: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
    page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
  }),
} as const;

export type UserModel = {
  [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};

export type User = UserModel["user"];
export type CreateUserInput = UserModel["createUserBody"];
export type UpdateUserInput = UserModel["updateUserBody"];
