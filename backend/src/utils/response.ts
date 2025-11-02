// Standardized API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId?: string;
  };
}

// Function to create a response
export const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any }
): ApiResponse<T> => ({
  success,
  data,
  error,
  meta: {
    timestamp: new Date(),
  },
});

// Convenience function to create a successful response
export const successResponse = <T>(data: T): ApiResponse<T> =>
  createResponse(true, data);

// Convenience function to create an error response
export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiResponse<void> => createResponse(false, undefined, { code, message, details });
