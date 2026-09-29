import { Elysia } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";

export const users = new Elysia({ prefix: "/users" })
  // GET /api/users - List users with pagination
  .get(
    "/",
    async ({ query }) => {
      const result = await UserService.findAll(query);
      return result;
    },
    {
      query: UserModel.usersQuery,
      detail: {
        tags: ["Users"],
        summary: "Get paginated users",
      },
    }
  )

  // GET /api/users/:id - Get user by ID
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const user = await UserService.findById(id);
      return user;
    },
    {
      params: UserModel.userIdParams,
      detail: {
        tags: ["Users"],
        summary: "Get user by ID",
      },
    }
  )

  // POST /api/users - Create new user
  .post(
    "/",
    async ({ body, set }) => {
      const user = await UserService.create(body);
      set.status = 201;
      return user;
    },
    {
      body: UserModel.createUserBody,
      detail: {
        tags: ["Users"],
        summary: "Create a new user",
      },
    }
  )

  // PATCH /api/users/:id - Partial update user
  .patch(
    "/:id",
    async ({ params: { id }, body }) => {
      const updated = await UserService.update(id, body);
      return updated;
    },
    {
      params: UserModel.userIdParams,
      body: UserModel.updateUserBody,
      detail: {
        tags: ["Users"],
        summary: "Update user details",
      },
    }
  )

  // DELETE /api/users/:id - Remove user
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const result = await UserService.delete(id);
      return result;
    },
    {
      params: UserModel.userIdParams,
      detail: {
        tags: ["Users"],
        summary: "Delete a user",
      },
    }
  );
