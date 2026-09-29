import { Elysia } from "elysia";

export class HttpError extends Error {
  constructor(public override message: string, public status: number = 500) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Resource conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export const errorHandler = new Elysia({ name: "plugin.error-handler" })
  .error({
    HTTP_ERROR: HttpError,
    NOT_FOUND_ERROR: NotFoundError,
    BAD_REQUEST_ERROR: BadRequestError,
    UNAUTHORIZED_ERROR: UnauthorizedError,
    CONFLICT_ERROR: ConflictError,
  })
  .onError(({ code, error, status, set }) => {
    switch (code) {
      case "NOT_FOUND":
        return status(404, {
          success: false,
          error: "NOT_FOUND",
          message: error.message || "Endpoint not found",
        });

      case "VALIDATION":
        return status(422, {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.all ? error.all : error.message,
        });

      case "PARSE":
        return status(400, {
          success: false,
          error: "PARSE_ERROR",
          message: "Unable to parse request payload",
        });

      case "NOT_FOUND_ERROR":
      case "BAD_REQUEST_ERROR":
      case "UNAUTHORIZED_ERROR":
      case "CONFLICT_ERROR":
      case "HTTP_ERROR":
        return status(error.status, {
          success: false,
          error: code,
          message: error.message,
        });

      default:
        console.error("Unhandled Server Error:", error);
        return status(500, {
          success: false,
          error: "INTERNAL_SERVER_ERROR",
          message: "An unexpected internal server error occurred",
        });
    }
  });
