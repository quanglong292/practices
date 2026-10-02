import { HttpResponse } from "./response";

export const errorHandler = (app: any) =>
  app.onError(({ code, error, set }: any) => {
    console.error(`[ErrorHandler] code=${code}`, error);

    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        return HttpResponse.error("Route not found", 404);

      case "VALIDATION":
        set.status = 422;
        return HttpResponse.error(
          "Validation failed",
          "VALIDATION_ERROR",
          error.message,
        );

      default:
        set.status = 500;
        return HttpResponse.error(
          "Internal Server Error",
          500,
          process.env.NODE_ENV === "development" ? error.message : undefined,
        );
    }
  });
