import { NotFoundError, ConflictError } from "@/plugins/error-handler";
import type { User, CreateUserInput, UpdateUserInput } from "./model";

// In-memory data store for practice/learning purposes
const usersStore: Map<string, User & { passwordHash: string }> = new Map();

// Seed initial practice data
usersStore.set("usr_1", {
  id: "usr_1",
  name: "Alice Doe",
  email: "alice@example.com",
  role: "admin",
  createdAt: new Date().toISOString(),
  passwordHash: await Bun.password.hash("password123"),
});

usersStore.set("usr_2", {
  id: "usr_2",
  name: "Bob Smith",
  email: "bob@example.com",
  role: "user",
  createdAt: new Date().toISOString(),
  passwordHash: await Bun.password.hash("secret456"),
});

export abstract class UserService {
  static async findAll(query: { limit?: number; page?: number } = {}) {
    const limit = query.limit ?? 10;
    const page = query.page ?? 1;
    const offset = (page - 1) * limit;

    const all = Array.from(usersStore.values()).map(
      ({ passwordHash: _, ...user }) => user
    );

    const total = all.length;
    const items = all.slice(offset, offset + limit);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string): Promise<User> {
    const record = usersStore.get(id);
    if (!record) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    const { passwordHash: _, ...user } = record;
    return user;
  }

  static async findByEmail(email: string) {
    for (const record of usersStore.values()) {
      if (record.email.toLowerCase() === email.toLowerCase()) {
        return record;
      }
    }
    return null;
  }

  static async create(data: CreateUserInput): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictError(`Email '${data.email}' is already registered`);
    }

    // Modern Bun native password hashing with Argon2 or bcrypt
    const passwordHash = await Bun.password.hash(data.password);
    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      name: data.name,
      email: data.email,
      role: data.role ?? "user",
      createdAt: now,
    };

    usersStore.set(id, { ...newUser, passwordHash });
    return newUser;
  }

  static async update(id: string, data: UpdateUserInput): Promise<User> {
    const record = usersStore.get(id);
    if (!record) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    if (data.email && data.email !== record.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw new ConflictError(`Email '${data.email}' is already in use`);
      }
    }

    const updatedUser: User = {
      ...record,
      name: data.name ?? record.name,
      email: data.email ?? record.email,
      role: data.role ?? record.role,
    };

    usersStore.set(id, { ...updatedUser, passwordHash: record.passwordHash });
    return updatedUser;
  }

  static async delete(id: string): Promise<{ success: boolean; id: string }> {
    const exists = usersStore.has(id);
    if (!exists) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    usersStore.delete(id);
    return { success: true, id };
  }
}
