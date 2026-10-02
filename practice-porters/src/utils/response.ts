export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  error?: {
    code: string | number;
    details?: any;
  };
}

export const HttpResponse = {
  success: <T>(data: T, message = "Success", meta?: any): ApiResponse<T> => ({
    success: true,
    message,
    data,
    meta,
  }),

  error: (
    message: string,
    code: number | string = 500,
    details?: any,
  ): ApiResponse => ({
    success: false,
    message,
    error: {
      code,
      details,
    },
  }),
};
