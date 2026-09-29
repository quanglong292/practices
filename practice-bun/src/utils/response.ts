export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export const successResponse = <T>(data: T, message?: string, meta?: Record<string, unknown>): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {}),
  };
};

export const errorResponse = (message: string, code?: string): ApiResponse<never> => {
  return {
    success: false,
    message,
    ...(code ? { meta: { code } } : {}),
  };
};
