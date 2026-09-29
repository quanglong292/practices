import { UnauthorizedError } from "@/plugins/error-handler";
import { UserService } from "@/modules/users/service";
import type { SignInInput, SignUpInput } from "./model";

export abstract class AuthService {
  static async signIn({ email, password }: SignInInput) {
    const user = await UserService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await Bun.password.verify(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate token (can be replaced with JWT or session token)
    const token = `tok_${crypto.randomUUID()}`;

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async signUp(data: SignUpInput) {
    const user = await UserService.create(data);
    const token = `tok_${crypto.randomUUID()}`;

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
